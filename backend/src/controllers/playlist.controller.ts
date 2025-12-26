import { Request, Response } from "express";
import { db } from "../libs/db.js";
import { errorResponse } from "../utils/errorHandler.js";

interface CreatePlaylistBody {
  name: string;
  description?: string;
}

interface AddProblemBody {
  problemIds: string[];
}

interface UpdatePlaylistBody {
  name: string;
  description?: string;
}

export const createPlaylist = async (
  req: Request<unknown, unknown, CreatePlaylistBody>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description } = req.body;
    const userId = req.user.id;

    const playlistExists = await db.playlist.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (playlistExists) {
      return res.status(400).json({
        success: false,
        message: "Playlist with this name already exists",
      });
    }

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return res.status(201).json({
      data: playlist,
      success: true,
      message: "Playlist created successfully",
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return errorResponse(res, 500, "Error While Creating Playlist", error);
  }
};

export const getAllListDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const playlists = await db.playlist.findMany({
      where: {
        userId,
      },
      include: {
        problems: {
          include: {
            problem: {
              include: {
                solvedBy: {
                  where: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: playlists,
      success: true,
      message: "Playlists fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return errorResponse(res, 500, "Error While Fetching Playlists", error);
  }
};

export const getPlayListDetails = async (
  req: Request<{ playlistId: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { playlistId } = req.params;
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: {
              include: {
                solvedBy: {
                  where: {
                    userId: req.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist doesn't exist",
      });
    }

    return res.status(200).json({
      data: playlist,
      success: true,
      message: "Playlist fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return errorResponse(res, 500, "Error While Fetching Playlist Details", error);
  }
};

export const deletePlaylist = async (
  req: Request<{ playlistId: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { playlistId } = req.params;
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist doesn't exist",
      });
    }

    await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return errorResponse(res, 500, "Error While Deleting Playlist", error);
  }
};

export const addProblemToPlaylist = async (
  req: Request<{ playlistId: string }, unknown, AddProblemBody>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing problemIds",
      });
    }

    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist not found",
      });
    }

    const existingProblems = await db.problemInPlaylist.findMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    const existingProblemIds = existingProblems.map((p) => p.problemId);
    const newProblemIds = problemIds.filter(
      (id) => !existingProblemIds.includes(id)
    );

    if (newProblemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "All problems are already in the playlist",
      });
    }

    const problemInPlaylist = await db.problemInPlaylist.createMany({
      data: newProblemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    return res.status(201).json({
      success: true,
      data: problemInPlaylist,
      message: "Problems added to playlist successfully",
    });
  } catch (error) {
    console.error("Error adding problems to playlist:", error);
    return errorResponse(
      res,
      500,
      "Error While Adding Problems to Playlist",
      error
    );
  }
};

export const removeProblemFromPlaylist = async (
  req: Request<{ playlistId: string }, unknown, AddProblemBody>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing problemIds",
      });
    }

    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist not found",
      });
    }

    await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Problems removed from playlist successfully",
    });
  } catch (error) {
    console.error("Error removing problems from playlist:", error);
    return errorResponse(
      res,
      500,
      "Error While Removing Problems from Playlist",
      error
    );
  }
};

export const updatePlaylist = async (
  req: Request<{ playlistId: string }, unknown, UpdatePlaylistBody>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Playlist name is required",
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Playlist name must be at least 3 characters",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: "Playlist name must be less than 100 characters",
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Description must be less than 500 characters",
      });
    }

    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist not found",
      });
    }

    // Check if name already exists for this user (excluding current playlist)
    const playlistExists = await db.playlist.findFirst({
      where: {
        name: name.trim(),
        userId: req.user.id,
        NOT: {
          id: playlistId,
        },
      },
    });

    if (playlistExists) {
      return res.status(400).json({
        success: false,
        error: "Playlist with this name already exists",
      });
    }

    const updatedPlaylist = await db.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedPlaylist,
      message: "Playlist updated successfully",
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return errorResponse(res, 500, "Error While Updating Playlist", error);
  }
};


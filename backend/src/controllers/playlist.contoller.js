import { db } from "../libs/db.js";

export const createPlaylist = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Creating Playlist",
    });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Fetching Playlists",
    });
  }
};

export const getPlayListDetails = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Fetching Playlist Details",
    });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Deleting Playlist",
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing problemIds",
      });
    }

    // Check if playlist belongs to user
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

    // Check for duplicate entries
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Adding Problems to Playlist",
    });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing problemIds",
      });
    }

    // Check if playlist belongs to user
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Removing Problems from Playlist",
    });
  }
};

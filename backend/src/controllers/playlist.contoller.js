import { db } from "../libs/db";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingPlaylist = await db.playlist.findUnique({
      where: {
        name,
      },
    });
    if (existingPlaylist) {
      return res.status(400).json({ message: "Playlist already exists" });
    }
    const userId = req.user.id;
    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });
    return res.status(200).json({
      data: playlist,
      success: true,
      message: "Playlist created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Creating Playlist" });
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
            problem: true,
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
    return res.status(500).json({ error: "Error While Fetching Playlists" });
  }
};
export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });
  if (!playlist) {
    return res.status(404).json({ error: "playlist doesn't exist" });
  }
  return res.status(200).json({
    data: playlist,
    success: true,
    message: "Playlist fetched successfully",
  });
};
export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId: req.user.id,
    },
  });
  if (!playlist) {
    return res.status(404).json({ error: "playlist doesn't exist" });
  }

  await db.playlist.delete({
    where: {
      id: playlistId,
    },
  });

  return res.status(200).json({ message: "Playlist deleted successfully" });
};
export const addProblemToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
    }

    const problemInPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    return res.status(201).json({
      success: true,
      data: problemInPlaylist,
      message: "Problem added to playlist successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Error While Adding Problem to Playlist" });
  }
};
export const removeProblemFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
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
      message: "Problem removed from playlist successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Error While Removing Problem from Playlist" });
  }
};

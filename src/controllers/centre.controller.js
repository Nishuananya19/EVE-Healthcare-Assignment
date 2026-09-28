const prisma = require("../config/database");

const createCentre = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        message: "Name and location are required",
      });
    }

    const centre = await prisma.diagnosticCentre.create({
      data: {
        name,
        location,
      },
    });

    res.status(201).json({
      message: "Diagnostic centre created successfully",
      centre,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCentres = async (req, res) => {
  try {
    const centres = await prisma.diagnosticCentre.findMany({
      include: {
        tests: {
          include: {
            test: true,
          },
        },
      },
    });

    res.json(centres);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCentreById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid centre ID",
      });
    }

    const centre = await prisma.diagnosticCentre.findUnique({
      where: { id },
      include: {
        tests: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!centre) {
      return res.status(404).json({
        message: "Diagnostic centre not found",
      });
    }

    res.json(centre);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCentre,
  getCentres,
  getCentreById,
};
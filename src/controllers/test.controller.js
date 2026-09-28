const prisma = require("../config/database");

const createTest = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Test name is required",
      });
    }

    const test = await prisma.diagnosticTest.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      message: "Diagnostic test created successfully",
      test,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTests = async (req, res) => {
  try {
    const tests = await prisma.diagnosticTest.findMany();

    res.json(tests);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addTestToCentre = async (req, res) => {
  try {
    const centreId = Number(req.params.centreId);
    const { testId, price } = req.body;

    if (Number.isNaN(centreId) || !testId || price === undefined) {
      return res.status(400).json({
        message: "Valid centre ID, test ID and price are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const centre = await prisma.diagnosticCentre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({
        message: "Diagnostic centre not found",
      });
    }

    const test = await prisma.diagnosticTest.findUnique({
      where: { id: Number(testId) },
    });

    if (!test) {
      return res.status(404).json({
        message: "Diagnostic test not found",
      });
    }

    const centreTest = await prisma.centreTest.create({
      data: {
        centreId,
        testId: Number(testId),
        price,
      },
    });

    res.status(201).json({
      message: "Test added to centre successfully",
      centreTest,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "This test is already available at this centre",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTest,
  getTests,
  addTestToCentre,
};
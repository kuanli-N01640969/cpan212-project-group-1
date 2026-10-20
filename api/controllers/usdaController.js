import { searchFoodFromUSDA } from "../services/usdaService.js";

export async function searchFood(req, res, next) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message:
          'Query parameter "query" is required (e.g., /api/usda/search?query=apple)',
      });
    }
    const foods = await searchFoodFromUSDA(query);
    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (err) {
    next(err);
  }
}

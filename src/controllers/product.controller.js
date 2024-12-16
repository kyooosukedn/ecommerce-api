const Product = require('../models/product.model');

exports.searchProducts = async (req, res) => {
    try {
        const {
            keyword,
            minPrice,
            maxPrice,
            category,
            minRating,
            sortBy,
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build the aggregation pipeline
        const pipeline = [];

        // Match stage for filtering
        const matchStage = {};

        // Text search if keyword provided
        if (keyword) {
            pipeline.push({
                $match: {
                    $text: { $search: keyword }
                }
            });
        }

        // Price range filter
        if (minPrice || maxPrice) {
            matchStage.price = {};
            if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
            if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
        }

        // Category filter
        if (category) {
            matchStage.category = category;
        }

        // Rating filter
        if (minRating) {
            matchStage.averageRating = { $gte: parseFloat(minRating) };
        }

        // Add match stage if there are any filters
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Sorting stage
        let sortStage = {};
        switch (sortBy) {
            case 'price':
                sortStage = { $sort: { price: sortOrder === 'desc' ? -1 : 1 } };
                break;
            case 'rating':
                sortStage = { $sort: { averageRating: sortOrder === 'desc' ? -1 : 1 } };
                break;
            case 'popularity':
                pipeline.push({
                    $addFields: {
                        popularityScore: {
                            $multiply: [
                                { $size: "$ratings" },
                                "$averageRating"
                            ]
                        }
                    }
                });
                sortStage = { $sort: { popularityScore: sortOrder === 'desc' ? -1 : 1 } };
                break;
            default:
                sortStage = { $sort: { createdAt: -1 } };
        }
        pipeline.push(sortStage);

        // Pagination
        const skip = (page - 1) * limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // Execute the aggregation
        const products = await Product.aggregate(pipeline);

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(matchStage);

        res.json({
            success: true,
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

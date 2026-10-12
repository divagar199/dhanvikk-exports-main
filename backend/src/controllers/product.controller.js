import {
  listProducts,
  getProductByIdOrSlug,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  updateProductStock,
  getUploadedLocalImages,
} from '../services/product.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const result = await listProducts(req.query);
    return res.status(200).json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      products: result.products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const product = await getProductByIdOrSlug(identifier);
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await updateProductService(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Product updated',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteProductService(id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await updateProductStock(id, req.body);
    return res.status(200).json({
      success: true,
      message: `Stock updated to ${product.stock}`,
      product,
      stock: product.stock,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    const host = (typeof req.get === 'function' ? req.get('host') : null) || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const filename = req.file.filename;
    const relativeUrl = `/uploads/${filename}`;
    const fullUrl = `${protocol}://${host}/uploads/${filename}`;

    return res.status(200).json({
      success: true,
      message: 'Product image uploaded and stored locally in code!',
      imageUrl: fullUrl,
      relativeUrl,
      filename,
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadedImages = (req, res, next) => {
  try {
    const images = getUploadedLocalImages(req);
    return res.status(200).json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    next(error);
  }
};

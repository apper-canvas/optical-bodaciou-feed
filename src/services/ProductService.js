import { toast } from 'react-toastify'

class ProductService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'product'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'price', 'discount_price', 'image', 'overlay_image', 
      'rating', 'review_count', 'is_new', 'category'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'price', 'discount_price', 'image', 
      'overlay_image', 'rating', 'review_count', 'is_new', 'category'
    ]
  }

  async fetchProducts(params = {}) {
    try {
      const queryParams = {
        fields: this.allFields,
        orderBy: [{ fieldName: 'CreatedOn', SortType: 'DESC' }],
        pagingInfo: { limit: 20, offset: 0 },
        ...params
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, queryParams)
      
      if (!response || !response.data) {
        return []
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
      return []
    }
  }

  async getProductById(productId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, productId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error)
      toast.error('Failed to load product details')
      return null
    }
  }

  async createProduct(productData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (productData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'price' || field === 'discount_price') {
            filteredData[field] = parseFloat(productData[field]) || 0
          } else if (field === 'rating') {
            filteredData[field] = parseFloat(productData[field]) || 0
          } else if (field === 'review_count') {
            filteredData[field] = parseInt(productData[field]) || 0
          } else if (field === 'is_new') {
            filteredData[field] = Boolean(productData[field])
          } else {
            filteredData[field] = productData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Product created successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to create product'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
      return null
    }
  }

  async updateProduct(productId, productData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: productId }
      this.updateableFields.forEach(field => {
        if (productData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'price' || field === 'discount_price') {
            filteredData[field] = parseFloat(productData[field]) || 0
          } else if (field === 'rating') {
            filteredData[field] = parseFloat(productData[field]) || 0
          } else if (field === 'review_count') {
            filteredData[field] = parseInt(productData[field]) || 0
          } else if (field === 'is_new') {
            filteredData[field] = Boolean(productData[field])
          } else {
            filteredData[field] = productData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Product updated successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to update product'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
      return null
    }
  }

  async deleteProduct(productId) {
    try {
      const params = {
        RecordIds: [productId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        toast.success('Product deleted successfully')
        return true
      } else {
        toast.error('Failed to delete product')
        return false
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
      return false
    }
  }

  async getTrendingProducts(limit = 4) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [{ fieldName: 'rating', SortType: 'DESC' }],
        pagingInfo: { limit, offset: 0 }
      }
      
      return await this.fetchProducts(params)
    } catch (error) {
      console.error('Error fetching trending products:', error)
      return []
    }
  }

  async searchProducts(searchTerm) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'Name',
            operator: 'Contains',
            values: [searchTerm]
          }
        ]
      }
      
      return await this.fetchProducts(params)
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }
}

// Export singleton instance
const productService = new ProductService()
export default productService
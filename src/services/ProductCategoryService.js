import { toast } from 'react-toastify'

class ProductCategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'product_category'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'image', 'product_count'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'image', 'product_count']
  }

  async fetchCategories(params = {}) {
    try {
      const queryParams = {
        fields: this.allFields,
        orderBy: [{ fieldName: 'Name', SortType: 'ASC' }],
        pagingInfo: { limit: 20, offset: 0 },
        ...params
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, queryParams)
      
      if (!response || !response.data) {
        return []
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching product categories:', error)
      toast.error('Failed to load categories')
      return []
    }
  }

  async getCategoryById(categoryId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, categoryId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching category with ID ${categoryId}:`, error)
      toast.error('Failed to load category details')
      return null
    }
  }

  async createCategory(categoryData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (categoryData[field] !== undefined) {
          filteredData[field] = categoryData[field]
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Category created successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to create category'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
      return null
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: categoryId }
      this.updateableFields.forEach(field => {
        if (categoryData[field] !== undefined) {
          filteredData[field] = categoryData[field]
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Category updated successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to update category'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
      return null
    }
  }

  async deleteCategory(categoryId) {
    try {
      const params = {
        RecordIds: [categoryId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        toast.success('Category deleted successfully')
        return true
      } else {
        toast.error('Failed to delete category')
        return false
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
      return false
    }
  }

  async searchCategories(searchTerm) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'Name',
            operator: 'Contains',
            values: [searchTerm]
          }
        ],
        orderBy: [{ fieldName: 'Name', SortType: 'ASC' }]
      }
      
      return await this.fetchCategories(params)
    } catch (error) {
      console.error('Error searching categories:', error)
      toast.error('Failed to search categories')
      return []
    }
  }
}

// Export singleton instance
const productCategoryService = new ProductCategoryService()
export default productCategoryService
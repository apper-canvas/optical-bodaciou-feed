import { toast } from 'react-toastify'

class CartService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'cart'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'is_active', 'total_amount', 'customer'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'is_active', 'total_amount', 'customer']
  }

  async fetchCarts(params = {}) {
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
      console.error('Error fetching carts:', error)
      toast.error('Failed to load carts')
      return []
    }
  }

  async getCartById(cartId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, cartId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching cart with ID ${cartId}:`, error)
      toast.error('Failed to load cart details')
      return null
    }
  }

  async getActiveCartByCustomer(customerId) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'customer',
            operator: 'ExactMatch',
            values: [customerId]
          },
          {
            fieldName: 'is_active',
            operator: 'ExactMatch',
            values: [true]
          }
        ]
      }
      
      const carts = await this.fetchCarts(params)
      return carts.length > 0 ? carts[0] : null
    } catch (error) {
      console.error('Error fetching active cart:', error)
      return null
    }
  }

  async createCart(cartData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (cartData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'total_amount') {
            filteredData[field] = parseFloat(cartData[field]) || 0
          } else if (field === 'is_active') {
            filteredData[field] = Boolean(cartData[field])
          } else {
            filteredData[field] = cartData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to create cart'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating cart:', error)
      toast.error('Failed to create cart')
      return null
    }
  }

  async updateCart(cartId, cartData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: cartId }
      this.updateableFields.forEach(field => {
        if (cartData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'total_amount') {
            filteredData[field] = parseFloat(cartData[field]) || 0
          } else if (field === 'is_active') {
            filteredData[field] = Boolean(cartData[field])
          } else {
            filteredData[field] = cartData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to update cart'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
      return null
    }
  }

  async deleteCart(cartId) {
    try {
      const params = {
        RecordIds: [cartId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        return true
      } else {
        toast.error('Failed to delete cart')
        return false
      }
    } catch (error) {
      console.error('Error deleting cart:', error)
      toast.error('Failed to delete cart')
      return false
    }
  }
}

// Export singleton instance
const cartService = new CartService()
export default cartService
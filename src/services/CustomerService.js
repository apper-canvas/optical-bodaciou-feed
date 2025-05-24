import { toast } from 'react-toastify'

class CustomerService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'Customer1'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'email', 'profile_image'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'email', 'profile_image']
  }

  async fetchCustomers(params = {}) {
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
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
      return []
    }
  }

  async getCustomerById(customerId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, customerId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching customer with ID ${customerId}:`, error)
      toast.error('Failed to load customer details')
      return null
    }
  }

  async getCustomerByEmail(email) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'email',
            operator: 'ExactMatch',
            values: [email]
          }
        ]
      }
      
      const customers = await this.fetchCustomers(params)
      return customers.length > 0 ? customers[0] : null
    } catch (error) {
      console.error('Error fetching customer by email:', error)
      return null
    }
  }

  async createCustomer(customerData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (customerData[field] !== undefined) {
          filteredData[field] = customerData[field]
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Customer profile created successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to create customer profile'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer profile')
      return null
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: customerId }
      this.updateableFields.forEach(field => {
        if (customerData[field] !== undefined) {
          filteredData[field] = customerData[field]
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Customer profile updated successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to update customer profile'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer profile')
      return null
    }
  }

  async deleteCustomer(customerId) {
    try {
      const params = {
        RecordIds: [customerId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        toast.success('Customer profile deleted successfully')
        return true
      } else {
        toast.error('Failed to delete customer profile')
        return false
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer profile')
      return false
    }
  }
}

// Export singleton instance
const customerService = new CustomerService()
export default customerService
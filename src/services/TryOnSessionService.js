import { toast } from 'react-toastify'

class TryOnSessionService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'try_on_session'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'customer_image', 'is_face_detected', 'status', 
      'selected_product', 'customer'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'customer_image', 'is_face_detected', 
      'status', 'selected_product', 'customer'
    ]
  }

  async fetchTryOnSessions(params = {}) {
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
      console.error('Error fetching try-on sessions:', error)
      toast.error('Failed to load try-on sessions')
      return []
    }
  }

  async getTryOnSessionById(sessionId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, sessionId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching try-on session with ID ${sessionId}:`, error)
      toast.error('Failed to load try-on session details')
      return null
    }
  }

  async createTryOnSession(sessionData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (sessionData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'is_face_detected') {
            filteredData[field] = Boolean(sessionData[field])
          } else {
            filteredData[field] = sessionData[field]
          }
        }
      })
      
      // Set default status if not provided
      if (!filteredData.status) {
        filteredData.status = 'Started'
      }
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to create try-on session'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating try-on session:', error)
      toast.error('Failed to create try-on session')
      return null
    }
  }

  async updateTryOnSession(sessionId, sessionData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: sessionId }
      this.updateableFields.forEach(field => {
        if (sessionData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'is_face_detected') {
            filteredData[field] = Boolean(sessionData[field])
          } else {
            filteredData[field] = sessionData[field]
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
        const errorMessage = response.results?.[0]?.message || 'Failed to update try-on session'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating try-on session:', error)
      toast.error('Failed to update try-on session')
      return null
    }
  }

  async deleteTryOnSession(sessionId) {
    try {
      const params = {
        RecordIds: [sessionId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        return true
      } else {
        toast.error('Failed to delete try-on session')
        return false
      }
    } catch (error) {
      console.error('Error deleting try-on session:', error)
      toast.error('Failed to delete try-on session')
      return false
    }
  }

  async getSessionsByCustomer(customerId) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'customer',
            operator: 'ExactMatch',
            values: [customerId]
          }
        ],
        orderBy: [{ fieldName: 'CreatedOn', SortType: 'DESC' }]
      }
      
      return await this.fetchTryOnSessions(params)
    } catch (error) {
      console.error('Error fetching customer try-on sessions:', error)
      return []
    }
  }
}

// Export singleton instance
const tryOnSessionService = new TryOnSessionService()
export default tryOnSessionService
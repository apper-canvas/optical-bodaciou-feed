import { toast } from 'react-toastify'

class TestimonialService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'testimonial'
    
    // All fields from the table definition
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 
      'ModifiedBy', 'content', 'rating', 'customer'
    ]
    
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'content', 'rating', 'customer']
  }

  async fetchTestimonials(params = {}) {
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
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to load testimonials')
      return []
    }
  }

  async getTestimonialById(testimonialId) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, testimonialId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching testimonial with ID ${testimonialId}:`, error)
      toast.error('Failed to load testimonial details')
      return null
    }
  }

  async createTestimonial(testimonialData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (testimonialData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'rating') {
            filteredData[field] = parseInt(testimonialData[field]) || 5
          } else {
            filteredData[field] = testimonialData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Review submitted successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to submit review'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error creating testimonial:', error)
      toast.error('Failed to submit review')
      return null
    }
  }

  async updateTestimonial(testimonialId, testimonialData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: testimonialId }
      this.updateableFields.forEach(field => {
        if (testimonialData[field] !== undefined) {
          // Ensure proper data formatting
          if (field === 'rating') {
            filteredData[field] = parseInt(testimonialData[field]) || 5
          } else {
            filteredData[field] = testimonialData[field]
          }
        }
      })
      
      const params = {
        records: [filteredData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results[0]?.success) {
        toast.success('Review updated successfully')
        return response.results[0].data
      } else {
        const errorMessage = response.results?.[0]?.message || 'Failed to update review'
        toast.error(errorMessage)
        return null
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update review')
      return null
    }
  }

  async deleteTestimonial(testimonialId) {
    try {
      const params = {
        RecordIds: [testimonialId]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success) {
        toast.success('Review deleted successfully')
        return true
      } else {
        toast.error('Failed to delete review')
        return false
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Failed to delete review')
      return false
    }
  }

  async getFeaturedTestimonials(limit = 3) {
    try {
      const params = {
        fields: this.allFields,
        where: [
          {
            fieldName: 'rating',
            operator: 'GreaterThanOrEqualTo',
            values: [4]
          }
        ],
        orderBy: [{ fieldName: 'rating', SortType: 'DESC' }],
        pagingInfo: { limit, offset: 0 }
      }
      
      return await this.fetchTestimonials(params)
    } catch (error) {
      console.error('Error fetching featured testimonials:', error)
      return []
    }
  }
}

// Export singleton instance
const testimonialService = new TestimonialService()
export default testimonialService
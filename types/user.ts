interface UserType {
  _id: string
  name: string
  email: string
  password: string
  isVerified: boolean
  isOAuth: boolean
  createdAt: Date
  updatedAt: Date
}

export default UserType
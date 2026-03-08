# Villtech - Smart Village Management System

A production-ready complaint and notice management system built with React, Firebase, and modern web technologies.

## 🚀 Features

### User Features
- **Complaint Management**: Create, view, and delete complaints
- **Department Categories**: 10 predefined departments for categorization
- **Priority Levels**: Low, Medium, High, Critical priority settings
- **Image Upload**: Attach images to complaints with automatic geolocation
- **Notice Viewing**: View official notices with PDF support
- **Text-to-Speech**: Innovative feature to listen to notice content
- **Google Maps Integration**: View complaint locations on map

### Admin Features
- **Dashboard Overview**: Real-time statistics and analytics
- **Complaint Management**: View, filter, and update complaint statuses
- **Notice Upload**: Upload PDF notices for users
- **Analytics Dashboard**: Department-wise, priority-wise, and status-wise statistics
- **Role-Based Access**: Secure admin-only functionality

### Technical Features
- **Firebase Authentication**: Secure email/password authentication
- **Firestore Database**: Scalable NoSQL database with security rules
- **Firebase Storage**: Image and PDF file storage
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-time Updates**: Live data synchronization
- **Modern Architecture**: Clean, scalable code structure

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **TailwindCSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **PDF.js** for PDF text extraction
- **Web Speech API** for text-to-speech

### Backend
- **Firebase Authentication**
- **Firebase Firestore**
- **Firebase Storage**
- **Firestore Security Rules**

## 📁 Project Structure

```
src/
 ├── app/
 ├── components/
 │   ├── layout/
 │   ├── shared/
 │   ├── complaint/
 │   └── notice/
 ├── pages/
 │   ├── auth/
 │   ├── admin/
 │   └── user/
 ├── services/
 │   ├── firebase.js
 │   ├── authService.js
 │   ├── complaintService.js
 │   └── noticeService.js
 ├── context/
 │   └── AuthContext.jsx
 ├── hooks/
 ├── utils/
 ├── routes/
 └── main.jsx
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   
   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   b. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   
   c. Configure Firebase Authentication:
   - Enable Email/Password sign-in method
   
   d. Set up Firestore Database:
   - Create a new database in test mode initially
   - Update security rules (see below)
   
   e. Set up Storage:
   - Enable Firebase Storage
   - Update storage rules (see below)

4. **Environment Configuration**
   
   Copy `.env.example` to `.env` and update with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Security Rules**
   
   **Firestore Rules** (`firestore.rules`):
   ```bash
   firebase deploy --only firestore:rules
   ```
   
   **Storage Rules** (`storage.rules`):
   ```bash
   firebase deploy --only storage:rules
   ```

6. **Run the application**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Security Rules

### Firestore Security Rules
- Users can only read/write their own data
- Admins have full access to manage complaints and notices
- Role-based access control implemented

### Storage Security Rules
- File size limits (5MB for images, 10MB for PDFs)
- Content type validation
- User-based access control

## 👥 User Roles

### User (Default)
- Register and login
- Create complaints with images
- View own complaints
- View notices with text-to-speech
- Delete own complaints

### Admin (Manual Assignment)
- View all complaints
- Update complaint statuses
- Upload notices
- Access analytics dashboard
- Full system management

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  role: 'user' | 'admin',
  createdAt: timestamp
}
```

### Complaints Collection
```javascript
{
  complaintId: string,
  userId: string,
  userEmail: string,
  title: string,
  description: string,
  department: string,
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected',
  imageURL?: string,
  latitude: number,
  longitude: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Notices Collection
```javascript
{
  noticeId: string,
  title: string,
  fileURL: string,
  uploadedBy: string,
  createdAt: timestamp
}
```

## 🎯 Key Features Implementation

### Text-to-Speech System
- PDF text extraction using PDF.js
- Web Speech API for audio playback
- Voice selection and speed control
- Play, pause, and stop functionality

### Geolocation Services
- Automatic location capture on complaint creation
- Google Maps integration for location viewing
- Privacy-conscious location handling

### Real-time Updates
- Firebase real-time listeners
- Live status updates
- Instant notifications

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
All Firebase configuration is handled through environment variables for security.

## 📱 Responsive Design
- Mobile-first approach
- TailwindCSS utility classes
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The built application can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue for bugs

## 🌟 Acknowledgments

- Firebase for backend services
- React for the frontend framework
- TailwindCSS for styling
- PDF.js for PDF processing
- Lucide React for icons

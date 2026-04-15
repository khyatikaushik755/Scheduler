# Scheduling Platform (Calendly Clone)

A fullstack scheduling web application that closely replicates Calendly's design and user experience. Built as an SDE Intern assignment to demonstrate modern web development skills.

## 🎯 **Assignment Overview**

This project implements a functional scheduling/booking platform similar to Calendly, allowing users to create event types, set availability, and enable others to book time slots through public booking pages.

## ✨ **Features Implemented**

### **Core Features (Must Have)**
- ✅ **Event Types Management**
  - Create event types with name, duration, and URL slug
  - Edit and delete existing event types
  - List all event types on admin dashboard
  - Unique public booking links for each event type

- ✅ **Availability Settings**
  - Set available days of the week (Monday-Friday default)
  - Configure time slots for each day (9 AM - 5 PM default)
  - Timezone support (UTC default)

- ✅ **Public Booking Page**
  - Full month calendar view for date selection
  - Available time slots display for selected dates
  - Booking form collecting invitee name and email
  - Double-booking prevention
  - Booking confirmation page with meeting details

- ✅ **Meetings Management**
  - View upcoming and past meetings
  - Cancel meetings functionality
  - Meeting status tracking

### **Bonus Features (Good to Have)**
- ✅ **Email Notifications**
  - Booking confirmation emails with calendar invites
  - Meeting details and organizer information
- ✅ **Buffer Time**
  - Configurable buffer time between meetings
  - Prevents back-to-back bookings
- ✅ **Date-Specific Availability Overrides**
  - Override weekly availability for specific dates
  - Mark dates as unavailable or set custom hours
  - Perfect for holidays, vacations, or special events
- ✅ **Meeting Rescheduling**
  - Admin can reschedule existing meetings
  - Time slot validation and conflict checking
  - Modal-based rescheduling interface
- ✅ **Custom Invitee Questions**
  - Add custom questions to booking forms
  - Support for text, textarea, select, radio, and checkbox inputs
  - Required/optional question settings
  - Question answers stored and displayed in admin
- ✅ **Responsive Design**
  - Mobile, tablet, and desktop layouts
  - Tailwind CSS responsive utilities
- ✅ **Sample Data**
  - Pre-seeded database with event types and meetings

## 🛠 **Tech Stack**

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens (default user)
- **Email**: Nodemailer with Gmail SMTP
- **Date Handling**: date-fns library

## 📁 **Database Schema**

```sql
User (id, name, email, password)
EventType (id, name, slug, duration, timezone, description, bufferTime)
Availability (id, eventTypeId, weekday, startTime, endTime)
DateOverride (id, eventTypeId, date, startTime, endTime, isAvailable)
CustomQuestion (id, eventTypeId, question, type, required, options, order)
Meeting (id, eventTypeId, inviteeName, inviteeEmail, startDateTime, endDateTime, status)
QuestionAnswer (id, meetingId, question, answer)
```

## 🚀 **Setup Instructions**

### **Prerequisites**
- Node.js 18+
- MySQL 8.0+
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd scheduling-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/scaler"
   NEXT_PUBLIC_APP_NAME="Scheduler"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed sample data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Admin Dashboard: `http://localhost:3000`
   - Login: `http://localhost:3000/login` (admin@example.com / password123)
   - Public Booking: `http://localhost:3000/booking/{event-slug}`

## 🎨 **UI/UX Design**

The application closely follows Calendly's design patterns:
- Clean, minimal interface with rounded corners
- Consistent color scheme (slate grays, blue accents)
- Card-based layouts with subtle shadows
- Responsive grid systems
- Intuitive navigation and form flows

## 📱 **Responsive Design**

- **Mobile**: Single column layouts, touch-friendly buttons
- **Tablet**: Two-column grids, optimized spacing
- **Desktop**: Multi-column layouts, full feature access

## 🔐 **Authentication**

- Default admin user pre-configured
- JWT-based session management
- Protected admin routes
- Public booking pages (no auth required)

## 📧 **Email Integration**

- Automated booking confirmations
- Calendar invite attachments (.ics files)
- HTML email templates
- SMTP configuration via Gmail

## 🧪 **Testing**

```bash
# Run tests (if implemented)
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 **Deployment**

### **Vercel (Recommended for Next.js)**
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add the following in Vercel dashboard:
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   NEXT_PUBLIC_APP_NAME=Scheduler
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_SECRET=your-super-secret-jwt-key
   ```
3. **Database**: Ensure your MySQL database is accessible from Vercel
4. **Deploy**: Push to main branch or deploy manually

### **Railway**
1. **Connect Git**: Link your GitHub repository
2. **Database**: Railway provides PostgreSQL - update `DATABASE_URL`
3. **Environment Variables**: Set the same variables as above
4. **Deploy**: Automatic on push

### **Render**
1. **Create Web Service**: Connect your repository
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Environment**: Add all required environment variables
5. **Database**: Use Render PostgreSQL or external MySQL

### **Local Production**
```bash
npm run build
npm start
```

## 📦 **Production Checklist**

- [ ] Environment variables configured
- [ ] Database accessible and migrated
- [ ] Email service configured
- [ ] Domain/SSL configured
- [ ] Default user created
- [ ] Sample data seeded
- [ ] Responsive design tested
- [ ] All core features working

## 🤝 **Assumptions Made**

- Single admin user (no multi-user support)
- Weekly availability patterns (no date-specific overrides)
- UTC timezone default (configurable per event type)
- No buffer time between meetings
- Email notifications use Gmail SMTP
- Database uses MySQL (easily switchable to PostgreSQL)

## 📈 **Future Enhancements**

- [ ] Multiple availability schedules per event type
- [ ] Date-specific availability overrides
- [ ] Meeting rescheduling flow
- [ ] Buffer time configuration
- [ ] Custom booking form questions
- [ ] Multi-user support with proper authentication
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Timezone-aware scheduling
- [ ] Recurring meeting support

## 👥 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is for educational purposes as part of an SDE internship assignment.

---

**Built with ❤️ for learning and demonstration purposes**

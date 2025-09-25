# Business Analytics Dashboard

A comprehensive, real-time business analytics dashboard built with React, Node.js, TypeScript, PostgreSQL, and Redis.

## Features

### Core Features
- **Real-time Dashboards**: Live KPI monitoring with WebSocket updates
- **Multi-user Authentication**: Secure login with role-based access control
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Alert System**: Configurable alerts with real-time notifications
- **Data Export**: Export data in multiple formats (JSON, CSV)
- **Custom Widgets**: Create and customize dashboard widgets

### Advanced Features
- **Predictive Analytics**: Machine learning-powered forecasting
- **Anomaly Detection**: Automated detection of data anomalies
- **ETL Pipeline**: Data ingestion and transformation capabilities
- **Scheduled Reports**: Automated report generation and delivery
- **Data Quality Monitoring**: Track data completeness and accuracy
- **Performance Optimization**: Caching and API rate limiting

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for session management and caching
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT tokens with bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YoussefChlih/Business-Analytics-Dashboard.git
   cd Business-Analytics-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   
   Backend (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=analytics_dashboard
   DB_USER=postgres
   DB_PASSWORD=your_password
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend (`frontend/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb analytics_dashboard
   
   # Run schema
   psql -d analytics_dashboard -f database/schema.sql
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   # This starts both backend (port 5000) and frontend (port 3000)
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Credentials
- **Admin**: admin@example.com / password
- **User**: user@example.com / password

## Project Structure

```
Business-Analytics-Dashboard/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database and Redis config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── database/               # Database schemas and migrations
│   └── schema.sql
├── docs/                   # Documentation
└── scripts/                # Setup and deployment scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/overview` - Dashboard KPIs and metrics
- `GET /api/dashboard/widgets` - User's dashboard widgets
- `POST /api/dashboard/widgets` - Create custom widget

### Analytics
- `GET /api/analytics/charts/:type` - Chart data (revenue, orders, customers)
- `GET /api/analytics/predictions/:metric` - Predictive analytics
- `GET /api/analytics/anomalies/:metric` - Anomaly detection

### Data Management
- `GET /api/data/sources` - Data sources
- `POST /api/data/sources` - Create data source
- `POST /api/data/upload/csv` - Upload CSV data
- `GET /api/data/export/:table` - Export data

### Alerts
- `GET /api/alerts` - Get alerts
- `POST /api/alerts/rules` - Create alert rule
- `PATCH /api/alerts/:id/status` - Update alert status

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PATCH /api/users/:id/role` - Update user role

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Code Linting
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build the applications
2. Set up PostgreSQL and Redis
3. Configure environment variables
4. Run database migrations
5. Start the backend server
6. Serve the frontend build

## Features Walkthrough

### Dashboard
- Real-time KPIs (Revenue, Orders, Customers, AOV)
- Interactive charts and graphs
- Recent activity feed
- Quick stats and metrics

### Analytics
- Historical data analysis
- Predictive analytics with confidence intervals
- Anomaly detection with severity levels
- Custom date ranges and metrics

### Data Management
- Multiple data source connectors
- CSV file upload and processing
- Data quality metrics
- Export functionality

### Alerts
- Configurable alert rules
- Real-time notifications
- Multiple severity levels
- Alert history and management

### User Management
- Role-based access control
- User profile management
- Admin panel for user administration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Advanced ML models for predictions
- [ ] More data connectors (MySQL, MongoDB, APIs)
- [ ] Advanced data visualization options
- [ ] Mobile responsive improvements
- [ ] Automated testing suite
- [ ] Performance monitoring dashboard
- [ ] Multi-tenant support
- [ ] Advanced user permissions
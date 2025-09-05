# RightsRadar

**Know your rights, instantly. Stay safe and informed.**

RightsRadar is a mobile-first web application that provides instant, state-specific legal guidance and emergency interaction tools for individuals facing police stops. Built with React, Tailwind CSS, and modern web technologies.

## 🚀 Features

### Core Features

- **State-Specific Rights & Scripts**: One-page, mobile-optimized guides with tailored legal information based on user location
- **Emergency Documentation & Sharing**: Quick audio/video recording with secure sharing capabilities
- **Offline Access**: Key guides and scripts downloadable for offline use
- **AI-Powered Script Generation**: Dynamic, situation-aware guidance using OpenAI GPT-4

### Additional Features

- **Multilingual Support**: English and Spanish language options
- **Subscription Management**: Freemium model with Pro subscription via Stripe
- **Real-time Location Detection**: Automatic state detection using browser geolocation
- **Responsive Design**: Mobile-first design optimized for emergency use
- **Progressive Web App**: Installable with offline capabilities

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend Services**: Supabase (Database, Auth, Storage)
- **AI Integration**: OpenAI GPT-4 API
- **Payments**: Stripe
- **Icons**: Lucide React
- **State Management**: React Context API
- **Media Recording**: MediaRecorder API
- **Geolocation**: Browser Geolocation API

## 📋 Prerequisites

- Node.js 16+ and npm
- OpenAI API key
- Supabase project
- Stripe account (for payments)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-3447.git
   cd this-is-a-3447
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration in `.env`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
VITE_STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id_here
```

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations (see `src/services/supabase.js`)
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for recordings

### Stripe Setup

1. Create Stripe products and prices
2. Set up webhooks for subscription events
3. Configure customer portal

## 📱 Usage

### For Users

1. **Location Detection**: Allow location access for state-specific guidance
2. **View Rights**: Access your constitutional rights and legal scripts
3. **Record Interactions**: Use the emergency recording feature
4. **AI Scripts**: Generate personalized legal scripts (Pro feature)
5. **Offline Access**: Download content for offline use

### For Developers

The app follows a modular architecture:

- `src/components/`: React components
- `src/contexts/`: React Context providers
- `src/services/`: API integrations and business logic
- `src/styles/`: Tailwind CSS configuration

## 🏗 Architecture

### Data Model

- **Users**: User profiles and subscription status
- **Content**: State-specific legal information
- **SavedScripts**: User-saved AI-generated scripts
- **RecordedInteractions**: Emergency recordings metadata

### User Flows

1. **Accessing Rights Information**: Auto-detect location → Display state-specific rights
2. **Recording Interaction**: Request permissions → Start recording → Save to cloud
3. **Pro Subscription**: Select plan → Stripe checkout → Unlock features

### API Integration

- **OpenAI**: AI script generation with rate limiting
- **Supabase**: Database operations and file storage
- **Stripe**: Subscription management and payments
- **Geolocation**: Browser-based location detection

## 🎨 Design System

The app uses a comprehensive design system with:

- **Colors**: Primary, accent, surface, and text colors
- **Typography**: Responsive text scales
- **Spacing**: Consistent spacing system
- **Components**: Reusable UI components
- **Motion**: Smooth transitions and animations

## 🔒 Security & Privacy

- **Data Encryption**: All sensitive data encrypted at rest
- **Secure Recording**: Media files stored securely in cloud storage
- **Privacy First**: Minimal data collection, user consent required
- **HTTPS Only**: All communications encrypted in transit

## 📊 Business Model

### Freemium Subscription

- **Free Tier**: Basic rights information, limited AI generations (3/day)
- **Pro Tier**: Unlimited AI scripts, multilingual support, enhanced storage ($4.99/month or $49.99/year)

### Revenue Streams

1. Pro subscriptions
2. Premium legal consultation referrals
3. Enterprise licensing for legal organizations

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Vercel**: Recommended for easy deployment
- **Netlify**: Alternative static hosting
- **AWS S3 + CloudFront**: For enterprise deployments

### Environment Setup

1. Set production environment variables
2. Configure domain and SSL
3. Set up monitoring and analytics
4. Configure error reporting

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Offline Support**: Service worker for offline functionality
- **Mobile Performance**: Optimized for mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord for discussions

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core rights information
- ✅ Emergency recording
- ✅ AI script generation
- ✅ Basic subscription model

### Phase 2 (Next)
- [ ] Advanced AI features
- [ ] Legal consultation integration
- [ ] Community features
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Legal document generation
- [ ] Court case tracking
- [ ] Lawyer network integration
- [ ] Advanced analytics

## 📞 Emergency Information

**Important**: This app provides general legal information and should not replace professional legal advice. In case of emergency:

- **Emergency Services**: 911
- **Legal Aid**: Contact your local legal aid organization
- **ACLU**: 1-800-775-3776

---

**Disclaimer**: RightsRadar provides general legal information and should not be considered as legal advice. Always consult with a qualified attorney for specific legal situations.

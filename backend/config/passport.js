const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const config = require('../config');

// Check if Google OAuth is configured
const isGoogleConfigured = config.GOOGLE_CLIENT_ID && 
                           config.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
                           config.GOOGLE_CLIENT_SECRET && 
                           config.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET';

if (!isGoogleConfigured) {
  console.log('⚠️  Google OAuth is not configured');
  console.log('📖 See SETUP_GOOGLE_OAUTH.html for setup instructions');
  console.log('💡 The app will work with username/password login');
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.username);
});

// Deserialize user from the session
passport.deserializeUser(async (username, done) => {
  try {
    const user = await User.findOne({ username });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google OAuth if credentials are provided
if (isGoogleConfigured) {
  console.log('✅ Google OAuth configured successfully');
  
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback - Profile:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          displayName: profile.displayName
        });

        // Check if user already exists by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing Google user found:', user.username);
          return done(null, user);
        }

        // Check if user exists by email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google account to existing user
            console.log('Linking Google account to existing user:', user.username);
            user.googleId = profile.id;
            await User.findOneAndUpdate(
              { username: user.username },
              { googleId: profile.id, email }
            );
            return done(null, user);
          }
        }

        // Create new user
        const username = profile.emails?.[0]?.value?.split('@')[0] || 
                        `google_${profile.id.substring(0, 8)}`;
        
        console.log('Creating new Google user:', username);
        
        user = await User.create({
          username,
          email: email || `${profile.id}@gmail.com`,
          googleId: profile.id,
          password: 'GOOGLE_AUTH', // Placeholder - won't be used for Google login
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value
        });

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  ));
}

module.exports = passport;

#!/bin/bash

# Function to prompt for input with a default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local input
    
    read -p "$prompt [$default]: " input
    echo "${input:-$default}"
}

# Function to add environment variable to Vercel
add_env_var() {
    local name="$1"
    local value="$2"
    local env="$3"
    
    echo "Adding $name to $env environment..."
    vercel env add "$name" "$env"
    echo "$value" | vercel env pull "$name" "$env"
}

# Check if user is logged in
if ! vercel whoami > /dev/null 2>&1; then
    echo "Please login to Vercel first: vercel login"
    exit 1
fi

# Get project name
PROJECT_NAME=$(prompt_with_default "Enter your project name" "fastfilms")

# Get environment
ENVIRONMENT=$(prompt_with_default "Enter environment (staging/production)" "staging")

# Get Stripe test keys
echo "Please enter your Stripe test keys (get them from https://dashboard.stripe.com/apikeys)"
STRIPE_PUBLISHABLE_KEY=$(prompt_with_default "Enter Stripe Publishable Key" "pk_test_...")
STRIPE_SECRET_KEY=$(prompt_with_default "Enter Stripe Secret Key" "sk_test_...")

# Get Stripe webhook secret
echo "Please create a webhook endpoint in Stripe Dashboard and enter the signing secret"
STRIPE_WEBHOOK_SECRET=$(prompt_with_default "Enter Stripe Webhook Secret" "whsec_...")

# Get database URL
DATABASE_URL=$(prompt_with_default "Enter Database URL" "postgresql://...")

# Generate a random string for NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Add environment variables
add_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY" "$ENVIRONMENT"
add_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "$ENVIRONMENT"
add_env_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" "$ENVIRONMENT"
add_env_var "DATABASE_URL" "$DATABASE_URL" "$ENVIRONMENT"
add_env_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "$ENVIRONMENT"
add_env_var "NEXTAUTH_URL" "https://$PROJECT_NAME-$ENVIRONMENT.vercel.app" "$ENVIRONMENT"

echo "Environment variables set up complete!"
echo "Next steps:"
echo "1. Deploy to Vercel: vercel deploy --prod"
echo "2. Set up webhook in Stripe Dashboard: https://$PROJECT_NAME-$ENVIRONMENT.vercel.app/api/webhooks/stripe"
echo "3. Test the payment flow using test card: 4242 4242 4242 4242" 
## ------------------------------------------------------------------- ##
##                                                                     ##
##    Multistage Dockerfile build process for a Next.JS application    ##
##                                                                     ##
## ------------------------------------------------------------------- ##


# ::::::::: BASE STAGE ::::::::: #

# Start the base stage with the official Docker Node image
FROM node:20 as base

# Set the base stage working directory
WORKDIR /app

# Copy the package.json and the package-lock.json into the working directory
COPY package*.json ./

# Expose the container port used by the next.js app
EXPOSE 3000


# ::::::::: BUILDER STAGE ::::::::: #

# Set the builder stage
FROM base as builder

# Set the builder stage working directory
WORKDIR /app

# Copy the app code files into the working directory
COPY . .

# Build app
RUN npm run build


# ::::::::: PRODUCTION STAGE ::::::::: #

# Set the production stage
FROM base as production

# Set the production stage working directory
WORKDIR /app

# Set the environnment variable to `production` in order to enable optimizations and disable debugging
ENV NODE_ENV=production

# Like npm install but in a cleaner way 
# (clean the node_modules directory + prevent packages auto upgrades + exclude developpement dependancies)
RUN npm ci

# Create a non-root user to avoid running the app as root (for security reason)
#RUN addgroup -g 1001 -S nodejs
#RUN adduser -S nextjs -u 1001
#USER nextjs

# Copy the build artifacts from the `builder` stage to the production stage (they will be placed under the non-root user ownership)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Run the app in production mode
CMD npm start


# ::::::::: DEVELOPPEMENT STAGE ::::::::: #

# Set the developpement stage
FROM base as dev

# Set the production stage working directory
WORKDIR /app

# Set the environnment variable to `development` in order to enable more verbose logging and debugging
ENV NODE_ENV=development

# Install all dependancies including all needed for developpement
RUN npm install

# Copy projects files into the working directory
COPY . .

# Run the app in devloppement mode
CMD npm run dev
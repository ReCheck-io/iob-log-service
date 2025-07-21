# nginx Setup Guide for IoB Chain Logger API

This guide shows how to set up nginx with automatic SSL certificate management and mTLS for the IoB Chain Logger API.

## 📋 Prerequisites

- Ubuntu/Debian server with sudo access
- Domain name pointing to your server
- Node.js application running on port 4000

## 🔧 Installation Steps

### 1. Install nginx and certbot

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx
sudo apt install nginx -y

# Install certbot for automatic SSL certificates
sudo apt install certbot python3-certbot-nginx -y

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Create CA Certificate for mTLS

```bash
# Create SSL directory for nginx
sudo mkdir -p /etc/nginx/ssl

# Generate CA private key
sudo openssl genrsa -out /etc/nginx/ssl/ca.key 4096

# Generate CA certificate (valid for 10 years)
sudo openssl req -new -x509 -days 3650 -key /etc/nginx/ssl/ca.key -out /etc/nginx/ssl/ca.crt \
  -subj "/C=US/ST=State/L=City/O=YourOrg/OU=IT/CN=IoB-Chain-Logger-CA"

# Secure the files
sudo chmod 600 /etc/nginx/ssl/ca.key
sudo chmod 644 /etc/nginx/ssl/ca.crt
```

### 3. Generate SSL Certificate with certbot

```bash
# Replace 'your-api-domain.com' with your actual domain
sudo certbot --nginx -d your-api-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 4. Install nginx Configuration

```bash
# Copy the configuration file
sudo cp nginx/iob-chain-logger.conf /etc/nginx/sites-available/

# Update domain name in the config
sudo sed -i 's/your-api-domain.com/YOUR_ACTUAL_DOMAIN/g' /etc/nginx/sites-available/iob-chain-logger.conf

# Enable the site
sudo ln -s /etc/nginx/sites-available/iob-chain-logger.conf /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Generate Client Certificates

```bash
# Generate client certificate (for your application users)
sudo openssl genrsa -out /etc/nginx/ssl/client.key 4096

sudo openssl req -new -key /etc/nginx/ssl/client.key -out /etc/nginx/ssl/client.csr \
  -subj "/C=US/ST=State/L=City/O=YourOrg/OU=Client/CN=api-client"

sudo openssl x509 -req -days 365 -in /etc/nginx/ssl/client.csr \
  -CA /etc/nginx/ssl/ca.crt -CAkey /etc/nginx/ssl/ca.key -CAcreateserial \
  -out /etc/nginx/ssl/client.crt

# Create PKCS#12 bundle for browser import
sudo openssl pkcs12 -export -out /etc/nginx/ssl/client.p12 \
  -inkey /etc/nginx/ssl/client.key -in /etc/nginx/ssl/client.crt \
  -certfile /etc/nginx/ssl/ca.crt -passout pass:YourPassword123

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/client.key
sudo chmod 644 /etc/nginx/ssl/client.crt
sudo chmod 644 /etc/nginx/ssl/client.p12
```

### 6. Setup Automatic Certificate Renewal

```bash
# Certbot automatically sets up renewal, but you can check:
sudo crontab -l | grep certbot

# Manual renewal test
sudo certbot renew --dry-run

# Add custom renewal hook if needed (restart services after renewal)
echo '#!/bin/bash
systemctl reload nginx
' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

## 🔍 Testing the Setup

### 1. Test without client certificate

```bash
curl -v https://your-api-domain.com/health
# Should work (health endpoint allows no client cert)
```

### 2. Test with client certificate

```bash
# Convert PKCS#12 to PEM for curl
openssl pkcs12 -in /etc/nginx/ssl/client.p12 -out client-cert.pem -nodes -passin pass:YourPassword123

# Test API endpoint
curl -v --cert client-cert.pem https://your-api-domain.com/cert-info
```

### 3. Test in browser

1. Download `/etc/nginx/ssl/client.p12` to your local machine
2. Import into browser (password: YourPassword123)
3. Visit `https://your-api-domain.com/cert-info`
4. Browser should prompt for certificate selection

## 📊 Monitoring and Logs

### Check nginx logs

```bash
# Access logs
sudo tail -f /var/log/nginx/iob-chain-logger.access.log

# Error logs
sudo tail -f /var/log/nginx/iob-chain-logger.error.log

# nginx status
sudo systemctl status nginx
```

### Check SSL certificate status

```bash
# Check certificate expiration
sudo certbot certificates

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/your-api-domain.com/fullchain.pem -text -noout
```

## 🔒 Security Considerations

### Firewall Setup

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Block direct access to Node.js port
sudo ufw deny 4000
```

### Certificate Management

- **Server certificates**: Automatically renewed by certbot
- **Client certificates**: Manually managed (generate per client/user)
- **CA certificate**: Keep CA private key secure and offline when possible

### nginx Security

```bash
# Hide nginx version
echo 'server_tokens off;' | sudo tee -a /etc/nginx/nginx.conf

# Reload nginx
sudo systemctl reload nginx
```

## 🚀 Production Deployment Checklist

- [ ] Domain DNS pointing to server
- [ ] SSL certificate installed and auto-renewing
- [ ] Client CA certificate properly configured
- [ ] Node.js application running and healthy
- [ ] nginx configuration tested
- [ ] Firewall properly configured
- [ ] Log rotation configured
- [ ] Monitoring set up (optional: Grafana/Prometheus)
- [ ] Backup procedures for CA certificate and keys

## 🔄 Certificate Renewal Process

The beauty of this setup is that it handles renewals automatically:

1. **Server certificates**: certbot renews automatically every 60 days
2. **nginx reloads**: Automatic via renewal hooks
3. **Zero downtime**: nginx reload doesn't drop connections
4. **Client certificates**: Only need renewal if you set shorter validity periods

This production setup provides:
- ✅ Automatic SSL certificate management
- ✅ Zero-downtime certificate renewals
- ✅ mTLS client authentication
- ✅ Load balancing capability
- ✅ Security headers and rate limiting
- ✅ Proper logging and monitoring 
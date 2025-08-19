#!/bin/bash

# IoB Chain Logger - Certificate Generation Script
# Generates mTLS certificates compatible with macOS and browsers for development/testing

set -e

CERT_DIR="./api/certs"
DAYS=365

echo "🔐 Generating IoB Chain Logger mTLS certificates..."
echo "📁 Output directory: $CERT_DIR"

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

# Clean up old certificates
echo "🧹 Cleaning up old certificates..."
rm -f *.crt *.key *.p12 *.srl *.ext *.csr

echo "🏛️  Step 1: Generate CA (Certificate Authority)..."

# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate
openssl req -new -x509 -key ca.key -sha256 -subj "/C=US/ST=Test/L=Test/O=IoB Test CA/OU=IoB Test Unit" -days $DAYS -out ca.crt

echo "🖥️  Step 2: Generate server certificate..."

# Generate server private key
openssl genrsa -out server.key 4096

# Create server certificate signing request
openssl req -subj "/C=US/ST=Test/L=Test/O=IoB Test/OU=IoB Test Unit/CN=localhost" -new -key server.key -out server.csr

# Create server certificate extensions
cat > server.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate server certificate
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days $DAYS -sha256 -extfile server.ext

echo "� Step 3: Generate client certificate..."

# Generate client private key
openssl genrsa -out client.key 4096

# Create client certificate signing request
openssl req -subj "/C=US/ST=Test/L=Test/O=IoB Test/OU=IoB Test Unit/CN=IoB Test Client" -new -key client.key -out client.csr

# Create client certificate extensions
cat > client.ext << EOF
basicConstraints = CA:FALSE
nsCertType = client, email
nsComment = "OpenSSL Generated Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature, nonRepudiation, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection
EOF

# Generate client certificate
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days $DAYS -sha256 -extfile client.ext

echo "📦 Step 4: Generate PKCS#12 files..."

# Standard PKCS#12 for browsers
openssl pkcs12 -export -out client.p12 -inkey client.key -in client.crt -certfile ca.crt -name "IoB Test Client" -passout pass:

# macOS-compatible PKCS#12 (using older encryption for compatibility)
openssl pkcs12 -export -out client-macos.p12 -inkey client.key -in client.crt -certfile ca.crt -name "IoB Test Client" -descert -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-RC2-40 -macalg sha1 -passout pass:

# Clean up temporary files
rm -f *.csr *.ext

# Set appropriate permissions
chmod 644 *.crt *.p12 *.srl
chmod 600 *.key

echo "✅ Certificate generation complete!"
echo ""
echo "📋 Generated files:"
echo "   ca.crt              - Certificate Authority (install as trusted root)"
echo "   server.crt/key      - Server certificate for HTTPS"
echo "   client.crt/key      - Client certificate for mTLS"
echo "   client.p12          - Client cert for browsers (standard)"
echo "   client-macos.p12    - Client cert for macOS (compatible format)"
echo ""
echo "🔧 Development Setup:"
echo "   1. Install ca.crt as trusted root certificate"
echo "   2. Install client-macos.p12 in macOS Keychain"
echo "   3. Set certificate trust to 'Always Trust'"
echo "   4. Start server: npm run dev"
echo "   5. Test: https://localhost:4000"
echo ""
echo "⚠️  These certificates are for DEVELOPMENT/TESTING only!"
OU = IoB Test Unit

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical,CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[v3_server]
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[v3_client]
basicConstraints = CA:FALSE
nsCertType = client, email
nsComment = "OpenSSL Generated Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# 1. Generate CA private key
echo "1️⃣  Generating CA private key..."
openssl genrsa -out ca.key 4096

# 2. Generate CA certificate
echo "2️⃣  Generating CA certificate..."
openssl req -new -x509 -days $DAYS -key ca.key -out ca.crt \
  -config openssl.cnf \
  -extensions v3_ca \
  -subj "/C=US/ST=Test/L=Test/O=IoB Test CA/CN=IoB Test CA"

# 3. Generate server private key
echo "3️⃣  Generating server private key..."
openssl genrsa -out server.key 4096

# 4. Generate server certificate signing request
echo "4️⃣  Generating server certificate signing request..."
openssl req -new -key server.key -out server.csr \
  -config openssl.cnf \
  -subj "/C=US/ST=Test/L=Test/O=IoB Test Server/CN=localhost"

# 5. Generate server certificate
echo "5️⃣  Generating server certificate..."
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days $DAYS \
  -extensions v3_server \
  -extfile openssl.cnf

# 6. Generate client private key
echo "6️⃣  Generating client private key..."
openssl genrsa -out client.key 4096

# 7. Generate client certificate signing request
echo "7️⃣  Generating client certificate signing request..."
openssl req -new -key client.key -out client.csr \
  -config openssl.cnf \
  -subj "/C=US/ST=Test/L=Test/O=IoB Test Client/CN=test-client"

# 8. Generate client certificate
echo "8️⃣  Generating client certificate..."
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out client.crt -days $DAYS \
  -extensions v3_client \
  -extfile openssl.cnf

# Clean up temporary files
rm -f server.csr client.csr openssl.cnf

# Set appropriate permissions
chmod 600 *.key
chmod 644 *.crt

echo ""
echo "✅ Certificate generation complete!"
echo ""
echo "📋 Generated files:"

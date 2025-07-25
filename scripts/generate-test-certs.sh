#!/bin/bash

# Generate Test Certificates for IoB Chain Logger Development
# This script creates a CA, server certificate, and client certificate for local testing

set -e  # Exit on any error

CERT_DIR="./certs"
DAYS=365

echo "🔐 Generating test certificates for IoB Chain Logger..."
echo "📁 Certificates will be created in: $CERT_DIR"

# Create certificates directory
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

# Create OpenSSL configuration file for certificates
cat > openssl.cnf << EOF
[req]
default_bits = 4096
prompt = no
distinguished_name = req_distinguished_name
x509_extensions = v3_ca

[req_distinguished_name]
C = US
ST = Test
L = Test
O = IoB Test
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
echo "   📜 ca.crt      - Certificate Authority (use as TLS_CA_PATH)"
echo "   🔑 ca.key      - CA private key (keep secure)"
echo "   📜 server.crt  - Server certificate (use as TLS_CERT_PATH)"  
echo "   🔑 server.key  - Server private key (use as TLS_KEY_PATH)"
echo "   📜 client.crt  - Client certificate (for testing API calls)"
echo "   🔑 client.key  - Client private key (for testing API calls)"
echo ""

# Verify certificates
echo "🔍 Verifying certificates..."
echo "   CA certificate: $(openssl x509 -noout -subject -in ca.crt)"
echo "   Server certificate: $(openssl x509 -noout -subject -in server.crt)"
echo "   Client certificate: $(openssl x509 -noout -subject -in client.crt)"
echo ""

# Verify certificate chain
echo "🔗 Verifying certificate chains..."
if openssl verify -CAfile ca.crt server.crt > /dev/null 2>&1; then
    echo "   ✅ Server certificate chain is valid"
else
    echo "   ❌ Server certificate chain verification failed"
fi

if openssl verify -CAfile ca.crt client.crt > /dev/null 2>&1; then
    echo "   ✅ Client certificate chain is valid"
else
    echo "   ❌ Client certificate chain verification failed"
fi

echo ""
echo "🚀 Quick start for development:"
echo "   1. Copy .env.example to .env (or create one manually)"
echo "   2. Set CERT_MODE=direct in .env"
echo "   3. Start server: npm run dev"
echo "   4. Test with: curl -k --cert certs/client.crt --key certs/client.key https://localhost:4000/cert-info"
echo ""
echo "⚠️  Note: These are test certificates only - DO NOT use in production!"
echo ""

cd ..

# Show certificate fingerprints
echo "🔍 Certificate fingerprints:"
echo "   CA:     $(openssl x509 -noout -fingerprint -sha256 -inform pem -in $CERT_DIR/ca.crt | cut -d= -f2 | tr -d ':' | tr '[:upper:]' '[:lower:]')"
echo "   Server: $(openssl x509 -noout -fingerprint -sha256 -inform pem -in $CERT_DIR/server.crt | cut -d= -f2 | tr -d ':' | tr '[:upper:]' '[:lower:]')"
echo "   Client: $(openssl x509 -noout -fingerprint -sha256 -inform pem -in $CERT_DIR/client.crt | cut -d= -f2 | tr -d ':' | tr '[:upper:]' '[:lower:]')"
echo "" 
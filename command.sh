zip -r tenanttrails.zip tenanttrails/chatlog.txt tenanttrails/package.json tenanttrails/src/ tenanttrails/vercel.json tenanttrails/vite.config.js tenanttrails/index.html tenanttrails/README.md tenanttrails/public/

zip -r tenanttrails-api.zip tenanttrails-api -x "tenanttrails-api/node_modules/*" "tenanttrails-api/.env"

# Combined submission zip (run from the parent dir, so paths are tenanttrails/...)
zip -r tenanttrails.zip \
  tenanttrails/frontend \
  tenanttrails/backend \
  tenanttrails/demo \
  tenanttrails/README.md \
  tenanttrails/TenantTrails.postman_collection.json \
  tenanttrails/chatlog \
  -x "*/node_modules/*" "*/.env" "*/dist/*" "*/.vercel/*"

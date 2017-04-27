#!/bin/bash

URL="localhost"
PORT="5984"

if [ -z "${1}" ] || [ -z "${2}" ]; then
    HOST="http://$URL:$PORT"
    SECUREHOST="http://couchadmin:test@$URL:$PORT"
    echo "Setting up CouchDB for single node use"
    curl -X POST $HOST/_cluster_setup -H 'Content-Type: application/json' -d '{"action":"enable_cluster","username":"couchadmin","password":"test","bind_address":"0.0.0.0","port":5984}'
    curl -X POST $SECUREHOST/_cluster_setup -H 'Content-Type: application/json' -d '{"action":"finish_cluster"}'
else
    SECUREHOST="http://$1:$2@$URL:$PORT"
fi

echo "Setting up security on _users db"
curl -X PUT $SECUREHOST/_users/_security -d '{ "admins": { "names": [], "roles": ["admin"]}, "members": { "names": [], "roles": [admin]}}'
echo "Setting up HospitalRun config DB"
curl -X PUT $SECUREHOST/config
curl -X PUT $SECUREHOST/config/_security -d '{ "admins": { "names": [], "roles": ["admin"]}, "members": { "names": [], "roles": []}}'
curl -X PUT $SECUREHOST/config/_design/auth -d "{ \"validate_doc_update\": \"function(newDoc, oldDoc, userCtx) {if(userCtx.roles.indexOf('_admin')!== -1) {return;} else {throw({forbidden: 'This DB is read-only'});}}\"}"
echo "Setting up HospitalRun main DB"
curl -X PUT $SECUREHOST/main
curl -X PUT $SECUREHOST/main/_security -d '{ "admins": { "names": [], "roles": ["admin"]}, "members": { "names": [], "roles": ["user"]}}'
echo "Configure CouchDB authentication"
curl -X PUT $SECUREHOST/main/_design/auth -d "{\"validate_doc_update\": \"function(newDoc, oldDoc, userCtx) { if(userCtx.roles.indexOf('_admin')!== -1 || userCtx.roles.indexOf('admin')!== -1){ if (newDoc._id.indexOf('_design') === 0) { return; }}if (newDoc._id.indexOf('_') !== -1) {var idParts=newDoc._id.split('_');if (idParts.length >= 3) { var allowedTypes=['allergy','appointment','attachment','billingLineItem','customForm','diagnosis','imaging','incCategory','incidentNote','incident','invLocation','invPurchase','invRequest','inventory','invoice','lab','lineItemDetail','lookup','medication','operationReport','operativePlan','option','overridePrice','patientNote','patient','payment','photo','priceProfile','pricing','procCharge','procedure','report','sequence','userRole','visit','vital'];if (allowedTypes.indexOf(idParts[0]) !== -1) {if(newDoc._deleted || newDoc.data) {return;}}}}throw({forbidden: 'Invalid data'});}\"}"
curl -X PUT $SECUREHOST/_node/couchdb@localhost/_config/http/authentication_handlers -d '"{couch_httpd_oauth, oauth_authentication_handler}, {couch_httpd_auth, proxy_authentification_handler}, {couch_httpd_auth, cookie_authentication_handler}, {couch_httpd_auth, default_authentication_handler}"'
curl -X PUT $SECUREHOST/_node/couchdb@localhost/_config/couch_httpd_oauth/use_users_db -d '"true"'
echo "Add hradmin user for use in HospitalRun"
curl -X PUT $SECUREHOST/_users/org.couchdb.user:hradmin -d '{"name": "hradmin", "password": "test", "roles": ["System Administrator","admin","user"], "type": "user", "userPrefix": "p1"}'

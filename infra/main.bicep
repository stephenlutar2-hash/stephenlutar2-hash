targetScope = 'resourceGroup'

@description('Base name prefix for all resources')
param baseName string = 'szlholdings'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('PostgreSQL administrator login')
@secure()
param pgAdminLogin string

@description('PostgreSQL administrator password')
@secure()
param pgAdminPassword string

@description('Custom domain for Front Door (e.g. szlholdings.com)')
param customDomain string = 'szlholdings.com'

@description('Container image tag for the API server')
param apiImageTag string = 'latest'

@description('Azure Container Registry login server')
param acrLoginServer string = '${baseName}acr.azurecr.io'

@description('SKU for Redis Cache')
@allowed(['Basic', 'Standard', 'Premium'])
param redisSku string = 'Basic'

@description('SKU for PostgreSQL')
@allowed(['Burstable', 'GeneralPurpose', 'MemoryOptimized'])
param pgSkuTier string = 'Burstable'

@description('PostgreSQL compute size')
param pgSkuName string = 'Standard_B1ms'

@description('PostgreSQL storage size in GB')
param pgStorageSizeGB int = 32

var uniqueSuffix = uniqueString(resourceGroup().id, baseName)
var vaultName = '${baseName}-kv-${take(uniqueSuffix, 6)}'
var pgServerName = '${baseName}-pg-${take(uniqueSuffix, 6)}'
var redisName = '${baseName}-redis-${take(uniqueSuffix, 6)}'
var storageName = '${baseName}stor${take(uniqueSuffix, 8)}'
var logAnalyticsName = '${baseName}-logs-${take(uniqueSuffix, 6)}'
var appInsightsName = '${baseName}-ai-${take(uniqueSuffix, 6)}'
var caeEnvName = '${baseName}-cae-${take(uniqueSuffix, 6)}'
var containerAppName = '${baseName}-api'
var frontDoorName = '${baseName}-fd'
var wafPolicyName = '${baseName}waf'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVaultDeploy'
  params: {
    name: vaultName
    location: location
    containerAppPrincipalId: containerApp.outputs.principalId
  }
}

module postgres 'modules/postgres.bicep' = {
  name: 'postgresDeploy'
  params: {
    name: pgServerName
    location: location
    adminLogin: pgAdminLogin
    adminPassword: pgAdminPassword
    skuTier: pgSkuTier
    skuName: pgSkuName
    storageSizeGB: pgStorageSizeGB
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redisDeploy'
  params: {
    name: redisName
    location: location
    sku: redisSku
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    name: storageName
    location: location
  }
}

module containerApp 'modules/containerapp.bicep' = {
  name: 'containerAppDeploy'
  params: {
    envName: caeEnvName
    appName: containerAppName
    location: location
    logAnalyticsId: logAnalytics.id
    acrLoginServer: acrLoginServer
    imageTag: apiImageTag
    appInsightsConnectionString: appInsights.properties.ConnectionString
    keyVaultUrl: 'https://${vaultName}${environment().suffixes.keyvaultDns}'
    redisHost: '${redisName}.redis.cache.windows.net'
    redisPrimaryKey: redis.outputs.primaryKey
    storageAccountName: storageName
    pgHost: '${pgServerName}.postgres.database.azure.com'
    pgAdminLogin: pgAdminLogin
    pgAdminPassword: pgAdminPassword
  }
}

module frontDoor 'modules/frontdoor.bicep' = {
  name: 'frontDoorDeploy'
  params: {
    profileName: frontDoorName
    wafPolicyName: wafPolicyName
    apiBackendAddress: containerApp.outputs.fqdn
    customDomain: customDomain
    swaHostnames: [for (app, i) in frontendApps: staticWebApps[i].outputs.defaultHostname]
  }
  dependsOn: [staticWebApps]
}

var frontendApps = [
  'rosie'
  'aegis'
  'beacon'
  'lutar'
  'nimbus'
  'firestorm'
  'dreamera'
  'zeus'
  'apps-showcase'
  'readiness-report'
  'career'
]

module staticWebApps 'modules/staticwebapp.bicep' = [for app in frontendApps: {
  name: 'swa-${app}'
  params: {
    name: '${baseName}-${app}'
    location: location
  }
}]

output apiUrl string = 'https://${containerApp.outputs.fqdn}'
output keyVaultUrl string = keyVault.outputs.vaultUri
output storageAccountName string = storageName
output frontDoorEndpoint string = frontDoor.outputs.endpointHostName
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output pgServerFqdn string = '${pgServerName}.postgres.database.azure.com'
output redisFqdn string = '${redisName}.redis.cache.windows.net'

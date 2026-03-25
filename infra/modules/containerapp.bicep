@description('Container Apps Environment name')
param envName string

@description('Container App name')
param appName string

@description('Resource location')
param location string

@description('Log Analytics workspace resource ID')
param logAnalyticsId string

@description('ACR login server')
param acrLoginServer string

@description('Container image name')
param imageName string = 'szlholdings-api'

@description('Container image tag')
param imageTag string = 'latest'

@description('Application Insights connection string')
param appInsightsConnectionString string

@description('Key Vault URL')
param keyVaultUrl string

@description('Redis host')
param redisHost string

@description('Redis primary key')
@secure()
param redisPrimaryKey string

@description('Storage account name')
param storageAccountName string

@description('PostgreSQL host')
param pgHost string

@description('PostgreSQL admin login')
@secure()
param pgAdminLogin string

@description('PostgreSQL admin password')
@secure()
param pgAdminPassword string

resource cae 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsId, '2023-09-01').customerId
        sharedKey: listKeys(logAnalyticsId, '2023-09-01').primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      activeRevisionsMode: 'Single'
      secrets: [
        {
          name: 'redis-url'
          value: 'rediss://:${redisPrimaryKey}@${redisHost}:6380'
        }
        {
          name: 'database-url'
          value: 'postgresql://${pgAdminLogin}:${pgAdminPassword}@${pgHost}:5432/szlholdings?sslmode=require'
        }
      ]
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: acrLoginServer
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api-server'
          image: '${acrLoginServer}/${imageName}:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '3000' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
            { name: 'AZURE_KEY_VAULT_URL', value: keyVaultUrl }
            { name: 'AZURE_REDIS_URL', secretRef: 'redis-url' }
            { name: 'AZURE_STORAGE_ACCOUNT_NAME', value: storageAccountName }
            { name: 'DATABASE_URL', secretRef: 'database-url' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
output principalId string = containerApp.identity.principalId

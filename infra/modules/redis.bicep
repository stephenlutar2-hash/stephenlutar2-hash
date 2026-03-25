@description('Redis cache name')
param name string

@description('Resource location')
param location string

@description('Redis SKU')
@allowed(['Basic', 'Standard', 'Premium'])
param sku string = 'Basic'

var skuFamily = sku == 'Premium' ? 'P' : 'C'
var skuCapacity = sku == 'Basic' ? 0 : 1

resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: name
  location: location
  properties: {
    sku: {
      name: sku
      family: skuFamily
      capacity: skuCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

output hostName string = redis.properties.hostName
output sslPort int = redis.properties.sslPort
output primaryKey string = redis.listKeys().primaryKey

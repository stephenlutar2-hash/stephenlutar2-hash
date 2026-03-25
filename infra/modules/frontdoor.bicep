@description('Front Door profile name')
param profileName string

@description('WAF policy name')
param wafPolicyName string

@description('API backend address (Container App FQDN)')
param apiBackendAddress string

@description('Custom domain')
param customDomain string = 'szlholdings.com'

@description('Static Web App default hostnames (one per frontend)')
param swaHostnames array = []

resource wafPolicy 'Microsoft.Network/FrontDoorWebApplicationFirewallPolicies@2024-02-01' = {
  name: wafPolicyName
  location: 'Global'
  sku: {
    name: 'Premium_AzureFrontDoor'
  }
  properties: {
    policySettings: {
      mode: 'Prevention'
      enabledState: 'Enabled'
      requestBodyCheck: 'Enabled'
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
        {
          ruleSetType: 'Microsoft_BotManagerRuleSet'
          ruleSetVersion: '1.1'
        }
      ]
    }
    customRules: {
      rules: [
        {
          name: 'RateLimitRule'
          priority: 100
          ruleType: 'RateLimitRule'
          rateLimitThreshold: 1000
          rateLimitDurationInMinutes: 1
          action: 'Block'
          matchConditions: [
            {
              matchVariable: 'RequestUri'
              operator: 'RegEx'
              matchValue: ['.*']
            }
          ]
        }
      ]
    }
  }
}

resource frontDoor 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: profileName
  location: 'Global'
  sku: {
    name: 'Premium_AzureFrontDoor'
  }
}

resource endpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  parent: frontDoor
  name: '${profileName}-endpoint'
  location: 'Global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource apiOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: frontDoor
  name: 'api-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/api/health'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Disabled'
  }
}

resource apiOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: apiOriginGroup
  name: 'api-origin'
  properties: {
    hostName: apiBackendAddress
    httpPort: 80
    httpsPort: 443
    originHostHeader: apiBackendAddress
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

resource swaOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = if (length(swaHostnames) > 0) {
  parent: frontDoor
  name: 'swa-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 60
    }
    sessionAffinityState: 'Disabled'
  }
}

resource swaOrigins 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = [for (hostname, i) in swaHostnames: if (length(swaHostnames) > 0) {
  parent: swaOriginGroup
  name: 'swa-origin-${i}'
  properties: {
    hostName: hostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: hostname
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}]

resource apiRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: endpoint
  name: 'api-route'
  properties: {
    originGroup: {
      id: apiOriginGroup.id
    }
    patternsToMatch: ['/api/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
    supportedProtocols: ['Http', 'Https']
  }
  dependsOn: [apiOrigin]
}

resource swaDefaultRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = if (length(swaHostnames) > 0) {
  parent: endpoint
  name: 'swa-default-route'
  properties: {
    originGroup: {
      id: swaOriginGroup.id
    }
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
    supportedProtocols: ['Http', 'Https']
  }
  dependsOn: [swaOrigins, apiRoute]
}

resource customDomainResource 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: frontDoor
  name: replace(customDomain, '.', '-')
  properties: {
    hostName: customDomain
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource customDomainApiRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: endpoint
  name: 'custom-domain-api-route'
  properties: {
    originGroup: {
      id: apiOriginGroup.id
    }
    customDomains: [
      { id: customDomainResource.id }
    ]
    patternsToMatch: ['/api/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    supportedProtocols: ['Http', 'Https']
  }
  dependsOn: [apiOrigin]
}

resource customDomainSwaRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = if (length(swaHostnames) > 0) {
  parent: endpoint
  name: 'custom-domain-swa-route'
  properties: {
    originGroup: {
      id: swaOriginGroup.id
    }
    customDomains: [
      { id: customDomainResource.id }
    ]
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    supportedProtocols: ['Http', 'Https']
  }
  dependsOn: [swaOrigins, customDomainApiRoute]
}

resource securityPolicy 'Microsoft.Cdn/profiles/securityPolicies@2024-02-01' = {
  parent: frontDoor
  name: 'waf-security-policy'
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'
      wafPolicy: {
        id: wafPolicy.id
      }
      associations: [
        {
          domains: [
            { id: endpoint.id }
            { id: customDomainResource.id }
          ]
          patternsToMatch: ['/*']
        }
      ]
    }
  }
}

output endpointHostName string = endpoint.properties.hostName
output customDomainValidationToken string = customDomainResource.properties.validationProperties.validationToken
output frontDoorId string = frontDoor.id

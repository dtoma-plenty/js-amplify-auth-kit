export var backendCfg = {
    domain : "https://api-gateway-features.fuelplus.com",
    defaultClient: "portal-one-web-dev"
}

export var authCfg = {
        awsCookieName : "_fpAuth",
        awsRefreshCookieName : "_fpRefresh",
        pageLength: 30,
        langCookieName: "_fpLanguage",
        checkUserEnpoint: backendCfg.domain+"/user-management-service/api/users/findByEmail",
        getUserPoolEnpoint: backendCfg.domain+"/provisioning-service/api/identity-provider/getUserPoolClient",
        registerEndpoint: backendCfg.domain+"/tenant-registration-service/api/register",
        checkEmailEndpoint: backendCfg.domain+"/user-management-service/api/users/existsByEmail",
        tokenCheckInterval: 30000,
        tenantsPoolEndpoint: backendCfg.domain+"/user-management-service/api/users/",
}
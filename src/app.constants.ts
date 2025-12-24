
export class AppConstants {
    constructor() {}

    public static app = {
        xyz: 'xyz',
        jwt: {
            expiryTime: 3600,
            type: 'JWT' 
        },
        bucket: 'klruploads',
        key: 'uploads',
        S3: {
            user: 'user-profile-images',
            product: 'product-images'
        },
        userType: {
            admin: 'Admin',
            user: 'User',
            vendor: 'Vendor',
            deliveryBoy: 'DeliveryBoy'
        },
        status: {
            active: 1,
            inactive: 0
        }
    };

}
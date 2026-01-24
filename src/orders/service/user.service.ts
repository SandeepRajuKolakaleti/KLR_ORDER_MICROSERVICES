import { Injectable, NotFoundException } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { AppConstants } from '../../app.constants';
import { CreateApigateDto, UpdateUserDto } from '../models/dto/CreateApigate.dto';
import { LoginApigateDto } from '../models/dto/LoginApigate.dto';
import { AuthService } from './../../auth/services/auth/auth.service';
import { RedisCacheService } from './redis/redis.service';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Pagination } from '../models/pagination.interface';



@Injectable()
export class UserService {
    userApiToken: any;
    localToken: any;
    tokenData: any;
    token: any;
    mailOptions: any;
    userPermission:any;
    constructor(
        private http: HttpService,
        private authService: AuthService,
        private redisCacheService: RedisCacheService
    ) {
    }

    getHeaders(tokens: any): any {
        const headersRequest = {
            'Authorization': `Bearer ${tokens}`,
        };
        return headersRequest;
    }

    async getUsers(pagination: Pagination): Promise<Observable<any>> {
        this.token = await this.redisCacheService.get("localtoken");
        return this.http.get(process.env.USER_SERVER_URL+ 'api/users?offset='+ pagination.offset + '&limit='+ pagination.limit, { headers: this.getHeaders(this.token) })
            .pipe(
                map(response => (response as any).data)
            );
    }

    async createUser(file: Express.Multer.File, createdUserDto: CreateApigateDto) {
        console.log(JSON.stringify(createdUserDto), 'service data');
        this.token = await this.redisCacheService.get("localtoken");
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const formData = new FormData();
        formData.append('image', createdUserDto.image || '');
        formData.append('name', createdUserDto.name);
        formData.append('email', createdUserDto.email);
        formData.append('password', createdUserDto.password);
        formData.append('phonenumber', createdUserDto.phonenumber ? String(createdUserDto.phonenumber) : '');
        formData.append('userRole', createdUserDto.userRole);
        formData.append('permissionId', createdUserDto.permissionId ? String(createdUserDto.permissionId) : '');
        formData.append('permissionName', createdUserDto.permissionName ? String(createdUserDto.permissionName) : '');
        formData.append('address', createdUserDto.address ? String(createdUserDto.address) : '');
        formData.append('birthday', createdUserDto.birthday ? String(createdUserDto.birthday) : '');
        formData.append('revenue', createdUserDto.revenue ? String(createdUserDto.revenue) : '');
        formData.append('totalSales', createdUserDto.totalSales ? String(createdUserDto.totalSales) : '');
        formData.append('file', blob, file.originalname);
        return this.http.post(process.env.USER_SERVER_URL+ 'api/users/register', formData, { 
            headers: {
                'content-type': 'multipart/form-data',
                'Authorization': 'Bearer '+ this.token
            }
        }).pipe(
            map(response => (response as any).data)
        );
    }

    async update(file: Express.Multer.File, updateUserDto: UpdateUserDto) {
        console.log(JSON.stringify(updateUserDto), 'service data');
        this.token = await this.redisCacheService.get("localtoken");
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const formData = new FormData();
        formData.append('image', updateUserDto.image || '');
        formData.append('name', updateUserDto.name);
        formData.append('email', updateUserDto.email);
        formData.append('password', updateUserDto.password);
        formData.append('phonenumber', updateUserDto.phonenumber ? String(updateUserDto.phonenumber) : '');
        formData.append('userRole', updateUserDto.userRole);
        formData.append('permissionId', updateUserDto.permissionId ? String(updateUserDto.permissionId) : '');
        formData.append('permissionName', updateUserDto.permissionName ? String(updateUserDto.permissionName) : '');
        formData.append('Id', updateUserDto.Id ? String(updateUserDto.Id) : '');
        formData.append('address', updateUserDto.address ? String(updateUserDto.address) : '');
        formData.append('birthday', updateUserDto.birthday ? String(updateUserDto.birthday) : '');
        formData.append('revenue', updateUserDto.revenue ? String(updateUserDto.revenue) : '');
        formData.append('totalSales', updateUserDto.totalSales ? String(updateUserDto.totalSales) : '');
        formData.append('file', blob, file.originalname);
        return this.http.post(process.env.USER_SERVER_URL+ `api/users/update`, formData, { headers: this.getHeaders(this.token) })
        .pipe(
            map(response => (response as any).data)
        );
    }

    loginUser(loginUserDto: LoginApigateDto) {
        return this.http.post(process.env.USER_SERVER_URL+ 'api/users/login', loginUserDto)
            .pipe(
                map(response => (response as any).data)
            );
    }

    async findUserByEmail(email: String) {
        this.token = await this.redisCacheService.get("localtoken");
        return this.http.get(process.env.USER_SERVER_URL+ 'api/users/findByMail/' + email, { headers: this.getHeaders(this.token) })
            .pipe(map(response => (response as any).data));
    }

    async findUserById(id: String) {
        this.token = await this.redisCacheService.get("localtoken");
        return this.http.get(process.env.USER_SERVER_URL+ 'api/users/user/' + id, { headers: this.getHeaders(this.token) });
    }

    async resetUserPassword(resetPassword: LoginApigateDto) {
        // this.token = await this.redisCacheService.get("localtoken");
        return this.http.post(process.env.USER_SERVER_URL+ 'api/users/resetPassword', resetPassword)
            .pipe(
                map(response => (response as any).data)
            );
    }

    async generateApiGateToken(loginUserDto: any) {
        try {
            const user = lastValueFrom(await this.authService.generateJwt(loginUserDto));
            if (!user) {
                throw new NotFoundException('User not found');
            }
            console.log("Return with Local Token:", user);
            return user.then((response) => { 
                console.log(response)
                loginUserDto.tokenStr = response;
                this.localToken = response;
                return this.authenticateApiToken(loginUserDto);
            });
            
        } catch (error) {
            console.error('Error generating API token:', error);
            throw error;
        }
    }
    

    async authenticateApiToken(loginUserDto: any) {
        var email = loginUserDto.email;
        return this.loginUser(loginUserDto).pipe(map(async response => {
            const parsedResponse = JSON.parse(JSON.stringify(response));
                this.userApiToken = parsedResponse.access_token;
                this.userPermission = parsedResponse.user_Permission;
                await this.redisCacheService.set("email", email);
                await this.redisCacheService.set("localtoken", this.localToken);
                await this.redisCacheService.set("phoneNo", loginUserDto.phonenumber);
                await this.redisCacheService.set("userApiToken"+parsedResponse.id, this.userApiToken);
                await this.redisCacheService.set("userPermission", this.userPermission);
                await this.redisCacheService.set("id", parsedResponse.id);

                // Data Base Token Updated logic
                // this.tokenData = {
                //     "localtoken": this.localToken,
                //     "email": email,
                //     "phoneNo": loginUserDto.phonenumber,
                //     "apitoken": this.apigateToken
                // }
                // this.apigateService.createToken(this.tokenData);

                //Return result as response
                // send confirmation mail
                // this.mailDto.from="klrtechnogroups@gmail.com";
                // this.mailDto.to="sandeepraju538@gmail.com";
                // this.mailDto.subject="Test Mail";
                // this.mailDto.body="Hi Dude "+loginUserDto.email+" You are Successfully Logged in";
                // this.mailOptions =  this.mailTemplate.userEmailTemplate(this.mailDto);

                var userData = {
                    access_token_local: this.localToken,
                    token_type: 'JWT',
                    user_permission:this.userPermission,
                    expires_in: AppConstants.app.jwt.expiryTime,
                    id: parsedResponse.id
                };

                return userData;
            })
        );
    }

    async getImageUrlToBase64(payload: any, user: any): Promise<Observable<any>> {
        await this.getToken(user);
        return this.http.post(process.env.USER_SERVER_URL+ 'api/users/uploadImgToBase64', payload, { headers: this.getHeaders(this.token) })
        .pipe(
            map(response => (response as any).data)
        );
    }

    async getToken(user: any) {
        let newLoginToken = await this.redisCacheService.get("userApiToken"+user.id);
        this.token = newLoginToken;
    }

}
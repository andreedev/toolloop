import {inject, Injectable, signal} from '@angular/core';
import {User} from '../../models/entity/user';
import {UserApiService} from '../api/user.api.service';

@Injectable({
    providedIn: 'root',
})
export class UserDataService {
    private loadingUserPromise: Promise<User> | null = null;
    loggedInUser = signal<User | null>(null);
    private userApiService = inject(UserApiService)

    constructor() {

    }

    public async ensureUserLoaded(): Promise<User> {
        const currentUser = this.loggedInUser();
        if (currentUser) {
            return currentUser;
        }

        if (!this.loadingUserPromise) {
            this.loadingUserPromise = this.userApiService.getUserInfo()
                .then((response) => {
                    const loadedUser = response.body!.data as User;
                    this.loggedInUser.set(loadedUser);
                    return loadedUser;
                })
                .finally(() => {
                    this.loadingUserPromise = null;
                });
        }

        return this.loadingUserPromise;
    }
}

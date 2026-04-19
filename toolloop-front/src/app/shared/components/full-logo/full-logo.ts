import { Component } from "@angular/core";

@Component({
    selector: "full-logo",
    template: `
         <div class="flex items-center gap-2 text-center self-center">
            <img src="/img/logo.svg" alt="Logo" class="w-14 cursor-pointer" routerLink="/">
            <div class="text-3xl">
                <span class="font-extrabold text-lime-500">Tool</span>
                <span class="font-extrabold text-sky-400">Loop</span>
            </div>
        </div>
    `,
})
export class FullLogo {}

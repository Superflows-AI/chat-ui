import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactComponentWrapperComponent } from './chatUI.component';

const routes: Routes = [
  { path: '', component: ReactComponentWrapperComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

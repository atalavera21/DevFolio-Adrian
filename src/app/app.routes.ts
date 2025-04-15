import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
    //   {
    //     path: 'otra-pagina', // Ejemplo de otra página futura
    //     loadComponent: () =>
    //       import('./pages/otra-pagina/otra-pagina.component').then(
    //         (m) => m.OtraPaginaComponent
    //       ),
    //   },
    ],
  },
];

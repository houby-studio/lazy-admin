
const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/app',
    component: () => import('layouts/FullLayout.vue'),
    children: [
      { path: '/scripts', component: () => import('pages/ScriptsPage.vue') },
      { path: '/about', component: () => import('pages/AboutPage.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes

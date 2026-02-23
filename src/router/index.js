import { createRouter, createWebHistory } from 'vue-router'
import RegionSelector from '../components/RegionSelector.vue'
import RegionMap from '../components/RegionMap.vue'
import CourseLevelSelector from '../components/CourseLevelSelector.vue'
import CourseModule from '../components/CourseModule.vue'
import LessonViewer from '../components/LessonViewer.vue'
import AppellationList from '../components/AppellationList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: CourseLevelSelector
  },
  {
    path: '/regions',
    name: 'RegionSelector',
    component: RegionSelector
  },
  {
    path: '/regions/appellations',
    name: 'AppellationList',
    component: AppellationList
  },
  {
    path: '/region/:regionId',
    name: 'RegionMap',
    component: RegionMap,
    props: true
  },
  {
    path: '/course',
    name: 'CourseHome',
    component: CourseLevelSelector
  },
  {
    path: '/course/:levelId',
    name: 'CourseModule',
    component: CourseModule,
    props: true
  },
  {
    path: '/course/:levelId/lesson/:lessonId',
    name: 'LessonViewer',
    component: LessonViewer,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

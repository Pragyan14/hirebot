import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import Interviewee from './pages/Interviewee';
import Interviewer from './pages/Interviewer';
import './index.css'
import { Provider } from 'react-redux';
import store from './app/store';
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' >
      <Route path='/interviewee' element={<Interviewee />}></Route>
      <Route path='/interviewer' element={<Interviewer />}></Route>
    </Route>
  )
)
let persistor = persistStore(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)

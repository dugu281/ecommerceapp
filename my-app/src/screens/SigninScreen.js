import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await Axios.post('http://localhost:4000/api/users/signin', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('SignIn Successful');
      setLoading(false);
      navigate(redirect || '/');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="container justify-content-center row shopping-cart">

      <h3 className="my-3 text-center fw-bold">Sign In</h3>


      <form onSubmit={submitHandler} className='col-12 col-md-6 col-lg-6'>


        <div class="mb-3">
          <label>Email</label>
          <input
            class="form-control bg-light"
            placeholder="email"
            aria-label="email"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>


        <div class="mb-3">
          <label>Password</label>
          <input
            class="form-control bg-light"
            placeholder="password"
            aria-label="password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <button type="submit" className='btn btn-primary text-light border-0 shadow'>{loading ?
            <span className='text-light'>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status"> Loading...</span>
            </span>
            :
            'Sign In'
          }</button>
        </div>

        <div className="mb-3">
          New customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Create new account</Link>
        </div>


      </form>
    </div>
  );
}

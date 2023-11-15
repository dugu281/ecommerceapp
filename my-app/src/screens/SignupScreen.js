import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const { data } = await Axios.post('http://localhost:4000/api/users/signup', {
        name,
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('SignUp Successful');
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

      <h3 className="my-3 text-center fw-bold">Sign Up</h3>


      <form onSubmit={submitHandler} className='col-12 col-md-6 col-lg-6'>

        <div class="mb-3">
          <label>Name</label>
          <input
            class="form-control bg-light"
            placeholder="name"
            aria-label="name"
            type="name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>



        <div class="mb-3">
          <label>Email</label>
          <input
            class="form-control bg-light"
            placeholder="email"
            aria-label="email"
            type="email"
            value={email}
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


        <div class="mb-3">
          <label>Confirm Password</label>
          <input
            class="form-control bg-light"
            placeholder="password"
            aria-label="password"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <button type="submit" className='btn btn-primary text-light border-0 shadow'>{loading ?
            <span className='text-light'>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status"> Loading...</span>
            </span>
            :
            'Sign Up'
          }</button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>


      </form>
    </div>
  );
}

import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function UserEditScreen() {
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: userId } = params;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`http://localhost:4000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `http://localhost:4000/api/users/${userId}`,
        { _id: userId, name, email, isAdmin },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  return (
    <div className="container justify-content-center row shopping-cart">

      <div className='row mb-3 align-items-center'>
        <div className='col'>
          <h3 className='fw-bold'>Edit User</h3>
        </div>
        <div className='col'>
          <label className='fs-6 text-primary'>User ID : </label>
          <input value={userId} disabled className='form-control bg-light w-100' />
        </div>
      </div>



      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <form onSubmit={submitHandler}>

          <div class="mb-3">
            <label>Name</label>
            <input
              class="form-control bg-light"
              placeholder="name"
              aria-label="name"
              type="name"
              value={name}
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
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>


          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)} />

            <label
              class="form-check-label"
              for="gridCheck">
              isAdmin
            </label>
          </div>


          <div className="mb-3">
            <button disabled={loadingUpdate} type="submit" className='btn btn-success'>
              Update
            </button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>


        </form>
      )}
    </div>
  );
}

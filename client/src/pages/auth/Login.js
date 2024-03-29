import React, { useState, useEffect } from "react";
import { auth, facebookAuthProvider, googleAuthProvider } from "../../firebase";
import { toast } from "react-toastify";
import { Button } from "antd";
import { MailOutlined, GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createOrUpdateUser } from "../../functions/auth";
import LRHeader from "../../components/nav/LRHeader";

const Login = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    let intended = history.location.state;
    if (intended) {
      return;
    } else {
      if (user && user.token) history.push("/");
    }
  }, [user, history]);

  let dispatch = useDispatch();

  const roleBasedRedirect = (res) => {
    // check if intended
    let intended = history.location.state;
    if (intended) {
      history.push(intended.from);
    } else {
      if (res.data.role === "admin") {
        history.push("/admin/dashboard");
      } else {
        history.push("/user/history");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const { user } = result;
      const idTokenResult = await user.getIdTokenResult();

      createOrUpdateUser(idTokenResult.token)
        .then((res) => {
          dispatch({
            type: "LOGGED_IN_USER",
            payload: {
              name: res.data.name,
              email: res.data.email,
              token: idTokenResult.token,
              role: res.data.role,
              _id: res.data._id,
            },
          });
          roleBasedRedirect(res);
        })
        .catch((err) => console.log(err));

    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    auth
      .signInWithPopup(googleAuthProvider)
      .then(async (result) => {
        const { user } = result;
        const idTokenResult = await user.getIdTokenResult();
        createOrUpdateUser(idTokenResult.token)
          .then((res) => {
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                name: res.data.name,
                email: res.data.email,
                token: idTokenResult.token,
                role: res.data.role,
                _id: res.data._id,
              },
            });
            roleBasedRedirect(res);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
      });
  };

  const facebookLogin = async () => {
    auth
      .signInWithPopup(facebookAuthProvider)
      .then(async (result) => {
        const { user } = result;
        const idTokenResult = await user.getIdTokenResult();
        createOrUpdateUser(idTokenResult.token)
          .then((res) => {
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                name: res.data.name,
                email: res.data.email,
                token: idTokenResult.token,
                role: res.data.role,
                _id: res.data._id,
              },
            });
            roleBasedRedirect(res);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
      });
  };

  const loginForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="email"
          className="form-control text-right"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ادخل الايميل"
          autoFocus
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          className="form-control text-right"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="ادخل كلمة السر"
        />
      </div>

      <br />
      <Button
        onClick={handleSubmit}
        type="blue"
        className="mb-2 w-500"
        block
        shape="round"
        icon={<MailOutlined />}
        size="large"
        disabled={!email || password.length < 6}
      >
        تسجيل الدخول باستخدام الاميل
      </Button>
    </form>
  );

  return (
    <>
      <LRHeader />
      <div className="container p-5">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            {loading ? (
              <h4 className="text-danger">Loading...</h4>
            ) : (
              <h4 className='text-right'>سجل الدخول</h4>
            )}
            {loginForm()}

            <Button
              onClick={googleLogin}
              type="danger"
              className="mb-2"
              block
              shape="round"
              icon={<GoogleOutlined />}
              size="large"
            >
              Google سجل الدخول باستخدام
          </Button>
            <br />
            <Button
              onClick={facebookLogin}
              className="mb-2"
              style={{ backgroundColor: "#3b5998", color: 'white' }}
              block
              shape="round"
              icon={<FacebookOutlined />}
              size="large"
            >
              Facebook   سجل الدخول باستخدام
          </Button>

            <Link to="/forgot/password" className="float-right text-danger">
              هل نسيت كلمة السر؟
          </Link>

            <Link to="/register" className="float-left text-danger">
              لاتملك حساباً؟
          </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

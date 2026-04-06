import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '@base-ui/react/button';
import { Input } from '@base-ui/react/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';

export default LoginPage(){
  const navigate = useNavigate();
  const setTokens = useAuthStore((s)=>s.setTokens);
  const setUser = useAuthStore((s)=>(s.setUser))

  const[email, setEmail] = useState('');
}
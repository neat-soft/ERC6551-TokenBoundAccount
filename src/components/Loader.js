import CircularProgress from '@mui/material/CircularProgress';
import './Loader.css'
export default function CircularIndeterminate() {
    return (
      <div className="loader">
        <CircularProgress />
      </div>
    );
}
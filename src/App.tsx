import * as React from 'react';
import Container from '@mui/material/Container';
import DataTable from './components/DataTable';



export default function App() {
  return (
    <Container maxWidth="xl" sx={{paddingBlock: "50px"}}>
      <DataTable />
    </Container>
  );
}

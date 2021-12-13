import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { v4 as uuid_v4 } from "uuid";
import SearchIcon from "@mui/icons-material/Search";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import ListItemText from "@mui/material/ListItemText";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";

import Logo from "../../assets/main-logo.png";

const SignupSchema = Yup.object().shape({
  movementType: Yup.string().required("Required"),
  name: Yup.string()
    .min(2, "Nombre muy Corto!")
    .max(50, "Nombre muy Largo!")
    .required("Required"),
  amount: Yup.number()
    .min(1, "Cantidad Debe ser Mayor a Cero")
    .required("Required"),
});

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [created, setCreated] = useState(false);
  const [finalBalance, setFinalBalance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({
    title: "",
    msg: "",
  });
  const [edit, setEdit] = useState({
    id: "",
    movementType: "",
    name: "",
    amount: "",
  });
  const handleOpenEditModal = () => setOpenEditModal(true);
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const createTransaction = (
    movementType: string,
    name: string,
    amount: string
  ) => {
    if (+movementType === 2 && finalBalance - +amount < 0) {
      setMessage({
        title: "Error",
        msg: "No cuenta con saldo suficiente para realizar este movimiento"
      })
      handleOpen();
    } else {
      fetch("http://localhost:5000/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuid_v4(),
          movementType,
          name,
          amount,
        }),
      }).then(() => {
        setCreated(!created);
        setMessage({
          title: "Registro Exitoso",
          msg: "El gasto o ingreso fue agregado con éxito"
        })
        handleOpen();
      });
    }
  };

  const balanceCalculator = (balance: number, transactions: any[]) => {
    let incomes = 0;
    let outcomes = 0;
    console.log(transactions);
    transactions.forEach((transaction: any) => {
      if (transaction.movementType === 1) {
        incomes += transaction.amount;
      } else {
        outcomes += transaction.amount;
      }
    });
    setFinalBalance(balance + (incomes - outcomes));
  };

  const handleInicialBalance = (initialBalance: number) => {
    setBalance(initialBalance);
    balanceCalculator(initialBalance, transactions);
  };

  const transactionsFilter = (value: number) => {
    if (value === 0) {
      fetch("http://localhost:5000/movimientos", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((json) => setTransactions(json));
    } else {
      fetch(`http://localhost:5000/movimientos?movementType=${value}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((json) => setTransactions(json));
    }
  };

  const deleteTransaction = (id: string) => {
    fetch(`http://localhost:5000/movimientos/${id}`, {
      method: "DELETE",
    }).then(() => setCreated(!created));
  };

  const openTransactionEditor = (transaction: any) => {
    setEdit(transaction);
    handleOpenEditModal();
  };

  const editTransaction = (values: any, id: string) => {
    console.log(values);
    fetch(`http://localhost:5000/movimientos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }).then(() => {
      setCreated(!created);
      handleCloseEditModal();
    });
  };

  const search = (value: string) => {
    fetch(`http://localhost:5000/movimientos?name_like=${value}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        setTransactions(json);
        balanceCalculator(balance, json);
      });
  }

  useEffect(() => {
    fetch("http://localhost:5000/movimientos", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        setTransactions(json);
        balanceCalculator(balance, json);
      });
  }, [created]);

  return (
    <div className="p-2">
      <header
        style={{
          backgroundColor: "#F1F1F1",
        }}
        className="p-3 mb-3"
      >
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
        >
          <div className="col-2">
            <img src={Logo} alt="logo-poli" className="img-fluid" />
          </div>
          <div className="col-1">
            <Typography variant="h5">Parcial</Typography>
          </div>
          <div className="col-2 offset-5">
            <TextField
              id="outlined-basic"
              type="number  "
              label="Saldo Inicial"
              variant="outlined"
              onChange={(e) => handleInicialBalance(+e.target.value)}
            />
          </div>
          <div className="col-2">
            <TextField
              id="outlined-basic"
              label="Saldo Final"
              variant="outlined"
              value={finalBalance}
              InputProps={{ readOnly: true }}
            />
          </div>
        </Box>
      </header>
      <Box display="flex" justifyContent="space-between">
        <div className="border border-dark rounded" style={{ width: "49%" }}>
          <div style={{ width: "100%", backgroundColor: "#CAC6C7" }}>
            <div className="col-1">
              <Typography variant="subtitle2">Registro</Typography>
            </div>
          </div>
          <Formik
            initialValues={{
              movementType: "",
              name: "",
              amount: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={(values) => {
              createTransaction(
                values.movementType,
                values.name,
                values.amount
              );
            }}
          >
            {({ errors, touched, handleChange, handleBlur }) => (
              <Form>
                <div className="col-12">
                  <TextField
                    className="mb-3 mt-3"
                    name="movementType"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.movementType}
                    select
                    style={{ minWidth: "18rem" }}
                    label="Tipo Movimiento"
                    helperText={
                      errors.movementType && touched.movementType
                        ? errors.movementType
                        : null
                    }
                  >
                    <MenuItem value={1}>Ingreso</MenuItem>
                    <MenuItem value={2}>Gasto</MenuItem>
                  </TextField>
                </div>
                <div className="col-12">
                  <TextField
                    className="mb-3"
                    name="name"
                    label="Nombre"
                    style={{ minWidth: "18rem" }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.name}
                    helperText={
                      errors.name && touched.name ? errors.name : null
                    }
                  />
                </div>
                <div className="col-12">
                  <TextField
                    className="mb-3"
                    name="amount"
                    type="number"
                    label="Cantidad"
                    style={{ minWidth: "18rem" }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.amount}
                    helperText={
                      errors.amount && touched.amount ? errors.amount : null
                    }
                  />
                </div>
                <Button variant="contained" type="submit" className="mb-3">
                  Agregar Movimiento
                </Button>
              </Form>
            )}
          </Formik>
        </div>
        <div className="border border-dark rounded" style={{ width: "49%" }}>
          <div className="d-flex" style={{ backgroundColor: "#CAC6C7" }}>
            <div className="col-3">
              <Typography variant="subtitle2">
                Listado de Movimientos
              </Typography>
            </div>
            <div className="col-1 offset-7">
              <span className="badge badge-pill badge-primary">
                {transactions.length}
              </span>
            </div>
          </div>
          <div className="d-flex px-3 align-items-center">
            <div className="col-6 p-0 d-flex">
              <TextField
                id="outlined-basic"
                className="mb-3 mt-3"
                label="Buscar"
                variant="outlined"
                onChange={(e) => search(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />,
                }}
              />
            </div>
            <div className="col-6 p-0">
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="filter"
                  name="row-radio-buttons-group"
                >
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Todos"
                    onClick={() => transactionsFilter(0)}
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Ingresos"
                    onClick={() => transactionsFilter(1)}
                  />
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Gastos"
                    onClick={() => transactionsFilter(2)}
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          {transactions.map(
            (transaction: {
              name: string;
              movementType: number;
              amount: number;
              id: string;
            }) => {
              return (
                <List className="px-3">
                  <ListItem disablePadding>
                    <IconButton
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      <ClearIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => openTransactionEditor(transaction)}
                    >
                      <EditIcon />
                    </IconButton>
                    <ListItemText primary={transaction.name} />
                    <Chip
                      color={`${
                        transaction.movementType === 1 ? "success" : "error"
                      }`}
                      label={`${transaction.amount.toLocaleString()} $`}
                    />
                  </ListItem>
                </List>
              );
            }
          )}
        </div>
      </Box>
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              movementType: edit.movementType,
              name: edit.name,
              amount: edit.amount,
            }}
            validationSchema={SignupSchema}
            onSubmit={(values) => {
              editTransaction(values, edit.id);
            }}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <div className="col-12">
                  <TextField
                    className="mb-3 mt-3"
                    name="movementType"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.movementType}
                    select
                    value={values.movementType}
                    style={{ minWidth: "18rem" }}
                    label="Tipo Movimiento"
                    helperText={
                      errors.movementType && touched.movementType
                        ? errors.movementType
                        : null
                    }
                  >
                    <MenuItem value={1}>Ingreso</MenuItem>
                    <MenuItem value={2}>Gasto</MenuItem>
                  </TextField>
                </div>
                <div className="col-12">
                  <TextField
                    className="mb-3"
                    name="name"
                    label="Nombre"
                    style={{ minWidth: "18rem" }}
                    onChange={handleChange}
                    value={values.name}
                    onBlur={handleBlur}
                    error={!!errors.name}
                    helperText={
                      errors.name && touched.name ? errors.name : null
                    }
                  />
                </div>
                <div className="col-12">
                  <TextField
                    className="mb-3"
                    name="amount"
                    type="number"
                    label="Cantidad"
                    style={{ minWidth: "18rem" }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.amount}
                    error={!!errors.amount}
                    helperText={
                      errors.amount && touched.amount ? errors.amount : null
                    }
                  />
                </div>
                <Button variant="contained" type="submit" className="mb-3">
                  Agregar Movimiento
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {message.title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {message.msg}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default Transactions;

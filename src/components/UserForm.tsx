import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getUserRoles } from '../formatters/role';
import { User } from "../custom-hooks/useTableData";

const mandatoryText = "*Mandatory Field"

const validationSchema = yup.object({
    name: yup.string().required(mandatoryText).test("name", "Only aplphabets and spaces are allowed", (value) => {
        return /^[a-zA-Z ]*$/.test(value)
    }),
    email: yup
        .string()
        .email('Invalid email')
        .required(mandatoryText),
    role: yup.string().required(mandatoryText),
    dob: yup.date().required(mandatoryText),
    shift: yup.string().required(mandatoryText),
    salary: yup.number().required(mandatoryText).lessThan(10000, "Salary must be less than 10,000 lacs"),

});

interface UserFormValues {
    name: string,
    role: string,
    email: string,
    dob: Dayjs | null,
    active: boolean,
    bio: string,
    shift: string,
    salary: string
}

const convertToExternal = (value: UserFormValues): User => {
    const { active, bio, dob, email, name, role, salary, shift } = value;
    return {
        active,
        bio,
        email,
        name,
        role,
        salary: Number(salary),
        shift,
        dob: dob ? dob.toISOString(): "",
        id: 0,
    }
}

const convertToInternal = (value: User): UserFormValues => {
    const { active, bio, dob, email, name, role, salary, shift } = value;
    return {
        active,
        bio,
        email,
        name,
        role,
        salary: String(salary),
        shift,
        dob: dob ? dayjs(dob): null,
    }
}

interface Props {
    handleClose: () => void;
    operationType: "edit" | "create";
    onSubmit: (values: User) => void;
    defaultValue: User
}

const UserForm = (props: Props) => {
    const { handleClose, operationType, onSubmit, defaultValue } = props;
    const formik = useFormik({
        initialValues: convertToInternal(defaultValue),
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const finalValues = convertToExternal(values)
            onSubmit(finalValues)
        },
    });

    const { handleBlur, handleChange, handleSubmit, values, errors, touched, setFieldTouched, setFieldValue } = formik;

    const formLabel = operationType === "edit" ? "Edit User" : "Create User"

    return <Dialog
        open={true}
        onClose={handleClose}
        PaperProps={{
            component: 'form',
            onSubmit: handleSubmit
        }}
    >
        <DialogTitle>{formLabel}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                To {operationType} to this user, please enter all information here. We
                will send updates in user table.
            </DialogContentText>
            <TextField
                variant="standard"
                fullWidth
                id="name"
                name="name"
                label="Name*"
                onChange={handleChange}
                value={values.name}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                sx={{ mb: 2 }}
            />
            <TextField
                variant="standard"
                fullWidth
                id="email"
                name="email"
                label="Email*"
                onChange={handleChange}
                value={values.email}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="standard" sx={{ mb: 2 }} >
                <InputLabel id="role-select">Role*</InputLabel>
                <Select
                    labelId="role-select"
                    id="demo-simple-select-standard"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="role"
                    label="Role"
                >
                    {getUserRoles().map((userRole) => (
                        <MenuItem key={userRole.value} value={userRole.value}>{userRole.label}</MenuItem>
                    ))}
                </Select>
                {touched.role && <FormHelperText error>{errors.role}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }} variant="standard">
                <FormLabel htmlFor="salary">Current Salary*</FormLabel>
                <Input
                    id="salary"
                    name="salary"
                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                    onChange={handleChange}
                    value={values.salary}
                    onBlur={handleBlur}
                    error={touched.salary && Boolean(errors.salary)}
                />
                {touched.salary && <FormHelperText error>{errors.salary}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date of birth*"
                        value={values.dob}
                        maxDate={dayjs('2022-04-17')}
                        onChange={(value) => { setFieldValue("dob", value) }}
                        onClose={() => { setFieldTouched("dob", true) }}
                    />
                    {touched.dob && <FormHelperText error>{errors.dob}</FormHelperText>}
                </LocalizationProvider>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel id="demo-shift">Shift*</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-shift"
                    name="shift"
                    value={values.shift}
                    onChange={handleChange}
                    onBlur={handleBlur}
                >
                    <FormControlLabel value="day" control={<Radio />} label="Day" />
                    <FormControlLabel value="night" control={<Radio />} label="Night" />
                    <FormControlLabel value="flexible" control={<Radio />} label="Flexible" />
                </RadioGroup>
                {touched.shift && <FormHelperText>{errors.shift}</FormHelperText>}
            </FormControl>
            <FormControlLabel
                sx={{ mb: 2 }}
                control={<Switch
                    checked={values.active}
                    name="active"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    inputProps={{ 'aria-label': 'controlled' }}
                />}
                label="Active"
            />
            <TextField
                fullWidth
                id="bio"
                label="Bio"
                name="bio"
                multiline
                rows={4}
                variant="standard"
                onChange={handleChange}
                value={values.bio}
                onBlur={handleBlur}
                error={touched.bio && Boolean(errors.bio)}
                helperText={touched.bio && errors.bio}
                sx={{ mb: 2 }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Submit</Button>
        </DialogActions>
    </Dialog>
};

export default UserForm;
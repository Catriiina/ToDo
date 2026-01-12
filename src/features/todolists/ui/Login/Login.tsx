import { selectThemeMode } from "@/app/app-slice"
import { useAppSelector } from "@/common/hooks"
import { getTheme } from "@/common/theme"
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Grid from "@mui/material/Grid2"
import TextField from '@mui/material/TextField'
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {LoginInputs, loginSchema} from "@/features/auth/lib/schemas/loginSchema.ts";
import {zodResolver} from "@hookform/resolvers/zod";

export const Login = () => {
    const themeMode = useAppSelector(selectThemeMode)

    const {
        handleSubmit,
        reset,
        control,
    } = useForm<LoginInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false }
    })

    const onSubmit: SubmitHandler<LoginInputs> = data => {
        console.log(data)
        reset()
    }

    const theme = getTheme(themeMode)

    return (
        <Grid container justifyContent={'center'}>
            <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
                <FormLabel>
                    <p>
                        To login get registered
                        <a
                            style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
                            href="https://social-network.samuraijs.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            here
                        </a>
                    </p>
                    <p>or use common test account credentials:</p>
                    <p>
                        <b>Email:</b> free@samuraijs.com
                    </p>
                    <p>
                        <b>Password:</b> free
                    </p>
                </FormLabel>
                <FormGroup>
                    <Controller
                        name ="email"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Email"
                                type="email"
                                error={!!error}
                                helperText={error?.message}
                                fullWidth
                            />
                        )}
                        />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Пароль"
                                type="password"
                                error={!!error}
                                helperText={error?.message}
                                fullWidth
                                />)}
                    />
                    <FormControlLabel
                        label="Remember me"
                        control={
                        <Controller
                            name={'rememberMe'}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Checkbox onChange={e => onChange(e.target.checked)} checked={value} />
                            )}
                        />
                    }

                    />
                    <Button type="submit" variant="contained" color="primary">
                        Login
                    </Button>
                </FormGroup>
            </FormControl>
                </form>
        </Grid>
    )
}
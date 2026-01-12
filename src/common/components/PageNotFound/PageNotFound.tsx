import styles from "./PageNotFound.module.css"
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import {PropsWithChildren} from "react";


type ButtonLinkProps = PropsWithChildren<{
    to: string;
}>;

export const ButtonLink = ({ to, children }: ButtonLinkProps) => {
    return (
        <Button
            component={RouterLink}
            to={to}
            variant="contained"
        >
            {children}
        </Button>
    );
};

export const PageNotFound = () => (
    <>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>page not found :( </h2>

        <ButtonLink to='/'>
            Перейти на главную страницу
        </ButtonLink>
    </>
)
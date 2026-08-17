import { Outlet, Navigate } from "react-router-dom";
function RotaPrivada() {
  const logado = localStorage.getItem("usuarioLogado");

  if (logado !== "true") {
    return <Navigate to={"/"} replace />;
  }
  return <Outlet />;
}
export default RotaPrivada;

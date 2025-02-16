import React from "react";
import { auth } from "../../../../../auth";

export default async function ScheulePage() {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
}

//primeiro apoós login, fazer o reconhecimento se o usuario ja existe no nosso banco
//  se sim, buscar o usuario do banco
// se nao, buscar o usuari ono prover com os dados extrar. e cadastrar ele no nosso banco.

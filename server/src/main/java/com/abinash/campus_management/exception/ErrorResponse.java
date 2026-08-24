package com.abinash.campus_management.exception;

import lombok.Getter;

import java.io.PrintWriter;
import java.io.StringWriter;

@Getter
public class ErrorResponse {
   private final boolean success = false;
   private final int status;
   private final String stackTrace;
   private final String message;

   public ErrorResponse(int status, String message, Throwable throwable){
       this.message = message;
       this.status = status;
       this.stackTrace = convertStackTraceToString(throwable);
   }

    private String convertStackTraceToString(Throwable throwable) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        return sw.toString();
    }
}
